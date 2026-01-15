package services

import (
	"log"
	"os"
	"testing"

	"github.com/Mykal-Steele/Adorio.git/config"
	"github.com/joho/godotenv"
)

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

func TestGetPaginatedPosts(t *testing.T) {
	posts, nextCursor, hasMore, err := GetPaginatedPosts(10, "")
	if err != nil {
		t.Fatalf("GetPaginatedPosts failed: %v", err)
	}

	// Check that posts slice is not nil
	if posts == nil {
		t.Error("Expected posts slice, got nil")
	}

	// If there are posts, check hasMore and nextCursor
	if len(posts) > 0 {
		if !hasMore {
			t.Error("Expected hasMore true when posts returned, got false")
		}
		if nextCursor == "" {
			t.Error("Expected nextCursor when posts returned, got empty")
		}
	} else {
		if hasMore {
			t.Error("Expected hasMore false when no posts, got true")
		}
		if nextCursor != "" {
			t.Error("Expected empty nextCursor when no posts, got", nextCursor)
		}
	}
}
