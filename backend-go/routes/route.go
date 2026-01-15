package routes

import (
	"github.com/Mykal-Steele/Adorio.git/controllers"
	"github.com/gin-gonic/gin"
)

func InitializeRoutes() *gin.Engine {
	r := gin.Default()
	publicRoutes := r.Group("v1/")
	publicRoutes.GET("health", func(ctx *gin.Context) {
		ctx.JSON(200, gin.H{"status": "Golang backend running"})

	})
	publicRoutes.GET("users", controllers.GetUsers)
	publicRoutes.GET("user/:id", controllers.GetUser)

	publicRoutes.GET("posts", controllers.GetPagPost)
	publicRoutes.GET("/post/:id", controllers.GetPost)

	return r
}
