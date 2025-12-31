package config

import (
	"log"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var Client *mongo.Client

func ConnectDatabase() error {
	uri := Environment.MongoURI
	log.Println("MONGO_URI:", uri)
	if uri == "" {
		log.Fatal("MONGO_URI Not found in the env file")
	}
	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		return err
	}
	Client = client
	return nil
}
