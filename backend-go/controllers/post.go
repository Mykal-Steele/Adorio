package controllers

import (
	"strconv"

	"github.com/Mykal-Steele/Adorio.git/services"
	"github.com/gin-gonic/gin"
)

func GetPost(c *gin.Context) {
	id := c.Param("id")
	post, err := services.GetPost(id)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get user"})
		return
	}
	c.JSON(200, post)
}

func GetPagPost(c *gin.Context) {
	limit, _ := strconv.ParseInt(c.DefaultQuery("limit", "10"), 10, 64)
	lastID := c.Query("last_id")

	posts, nextCursor, hasMore, err := services.GetPaginatedPosts(limit, lastID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get posts"})
		return
	}

	c.JSON(200, gin.H{
		"data":     posts,
		"next_id":  nextCursor,
		"has_more": hasMore,
	})
}
