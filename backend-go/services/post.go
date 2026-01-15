package services

import (
	"context"
	"log"
	"time"

	"github.com/Mykal-Steele/Adorio.git/config"
	"github.com/Mykal-Steele/Adorio.git/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
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

func GetPaginatedPosts(limit int64, lastID string) ([]models.Post, string, bool, error) {
	coll := getPostCollection()
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{}

	if lastID != "" {
		objID, err := bson.ObjectIDFromHex(lastID)
		if err != nil {
			log.Println("Invalid lastID format:", err)
			return nil, "", false, err
		}
		// Using $lt (less than) because MongoDB ObjectIDs
		// encode time; smaller ID = older post.
		filter = bson.M{"_id": bson.M{"$lt": objID}}
	}

	opts := options.Find().SetLimit(limit).SetSort(bson.D{{Key: "_id", Value: -1}})
	cursor, err := coll.Find(ctx, filter, opts)
	if err != nil {
		log.Println("Query failed:", err)
		return nil, "", false, err
	}
	defer cursor.Close(ctx)

	var posts []models.Post
	if err := cursor.All(ctx, &posts); err != nil {
		log.Println("Failed to decode posts:", err)
		return nil, "", false, err
	}

	// Identify the new "last_id" to send back to the client
	var nextCursor string
	if len(posts) > 0 {
		nextCursor = posts[len(posts)-1].ID.Hex()
	}

	hasMore := len(posts) == int(limit)
	return posts, nextCursor, hasMore, nil
}
