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

func getUserCollection() *mongo.Collection {
	return config.Client.Database("test").Collection("users")
}

func GetUser(id string) (models.User, error) {
	coll := getUserCollection()
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		log.Println("Invalid ID format:", err)
		return models.User{}, err
	}

	var user models.User
	if err := coll.FindOne(ctx, bson.M{"_id": objID}).Decode(&user); err != nil {
		log.Println("User not found")
		return models.User{}, err
	}

	return user, nil
}

// GetAllUsers fetches every user in the collection
func GetAllUsers() ([]models.User, error) {
	coll := getUserCollection()
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 1. Find returns a cursor
	cursor, err := coll.Find(ctx, bson.M{})
	if err != nil {
		log.Println("Error initiating find:", err)
		return nil, err
	}
	defer cursor.Close(ctx) // Always close your cursors!

	var users []models.User
	// 2. Short-statement: Decode all results into the slice
	if err := cursor.All(ctx, &users); err != nil {
		log.Println("Error decoding users list:", err)
		return nil, err
	}

	log.Println("Successfully retrieved users. Count:", len(users))
	return users, nil
}
