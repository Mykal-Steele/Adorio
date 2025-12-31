package config

import (
	"os"

	"github.com/joho/godotenv"
)

type EnvironmentConfig struct {
	JWTSecret string
	MongoURI  string
}

var Environment EnvironmentConfig

func init() {
	godotenv.Load()
	Environment = EnvironmentConfig{
		JWTSecret: os.Getenv("JWT_SECRET"),
		MongoURI:  os.Getenv("MONGO_URI"),
	}
}
