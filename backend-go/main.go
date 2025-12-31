package main

import (
	"log"

	"github.com/Mykal-Steele/Adorio.git/config"
	"github.com/Mykal-Steele/Adorio.git/routes"
)

func main() {
	err := config.ConnectDatabase()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	routes.InitializeRoutes()
	routes.Router.Run(":3001")
}
