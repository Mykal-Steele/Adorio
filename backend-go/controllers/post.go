package controllers

import (
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
