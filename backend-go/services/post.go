package services

import (
	"context"
	"log"
	"time"

	"github.com/Mykal-Steele/Adorio.git/config"
	"github.com/Mykal-Steele/Adorio.git/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func getPostCollection() *mongo.Collection {
	return config.Client.Database("test").Collection("posts")
}

func GetPost(id string) (models.Post, error) {
	// get post collection
	coll := getPostCollection()
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		log.Println("Invalid ID format:", err)
		return models.Post{}, err
	}

	var post models.Post
	if err := coll.FindOne(ctx, bson.M{"_id": objID}).Decode(&post); err != nil {
		log.Println("User not found")
		return models.Post{}, err
	}

	return post, nil
}
