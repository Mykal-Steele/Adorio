package controllers

import (
	"github.com/Mykal-Steele/Adorio.git/services"
	"github.com/gin-gonic/gin"
)

func GetUsers(c *gin.Context) {
	users, err := services.GetAllUsers()
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get users"})
		return
	}
	c.JSON(200, users)
}

func GetUser(c *gin.Context) {
	id := c.Param("id")
	user, err := services.GetUser(id)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get user"})
		return
	}
	c.JSON(200, user)
}
