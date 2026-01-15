package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/Mykal-Steele/Adorio.git/config"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

type PaginatedResponse struct {
	Data    []interface{} `json:"data"`
	NextID  string        `json:"next_id"`
	HasMore bool          `json:"has_more"`
}

func TestMain(m *testing.M) {
	// Load env
	err := godotenv.Load("../.env")
	if err != nil {
		log.Println("Error loading .env:", err)
	}
	// Set environment after loading
	config.Environment.MongoURI = os.Getenv("MONGO_URI")
	config.Environment.JWTSecret = os.Getenv("JWT_SECRET")

	// Connect to database
	err = config.ConnectDatabase()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	os.Exit(m.Run())
}

func TestInfiniteScrollPosts(t *testing.T) {
	// Set up router
	router := gin.Default()
	v1 := router.Group("v1/")
	v1.GET("posts", GetPagPost)

	// Test parameters
	limit := 10
	var lastID string
	totalRequests := 0

	for {
		// Build request
		req, _ := http.NewRequest("GET", "/v1/posts", nil)
		q := req.URL.Query()
		q.Add("limit", "10")
		if lastID != "" {
			q.Add("last_id", lastID)
		}
		req.URL.RawQuery = q.Encode()

		// Perform request
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// Check status
		if w.Code != 200 {
			t.Errorf("Expected status 200, got %d", w.Code)
		}

		// Parse response
		var resp PaginatedResponse
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		if err != nil {
			t.Fatal("Failed to unmarshal response:", err)
		}

		// Check data
		if resp.HasMore {
			if len(resp.Data) != limit {
				t.Errorf("Should return full limit %d when has_more is true, got %d", limit, len(resp.Data))
			}
			if resp.NextID == "" {
				t.Error("NextID should be present when has_more is true")
			}
		} else {
			if len(resp.Data) > limit {
				t.Errorf("Should return <= limit %d when no more, got %d", limit, len(resp.Data))
			}
			break // Exit the loop when no more data
		}

		// Set lastID for next request
		lastID = resp.NextID
		totalRequests++

		// Prevent infinite loop in case of bug
		if totalRequests > 1000 {
			t.Fatal("Too many requests, possible infinite loop")
		}
	}

	// Ensure we made at least one request and multiple to test infinite scroll
	if totalRequests <= 1 {
		t.Error("Should have made multiple paginated requests for infinite scroll")
	}
}
