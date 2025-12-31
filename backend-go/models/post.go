package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Post struct {
	ID      bson.ObjectID   `bson:"_id,omitempty" json:"id"`
	Title   string          `bson:"title" json:"title"`
	Content string          `bson:"content" json:"content"`
	User    bson.ObjectID   `bson:"user" json:"user"`
	Likes   []bson.ObjectID `bson:"likes" json:"likes"`
	Image     Image     `bson:"image" json:"image"`
	Comments  []Comment `bson:"comments" json:"comments"`
	CreatedAt time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time `bson:"updatedAt" json:"updatedAt"`
	Version   int       `bson:"__v" json:"v"`
}

type Comment struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Text      string        `bson:"text" json:"text"`
	User      bson.ObjectID `bson:"user" json:"user"`
	CreatedAt time.Time     `bson:"createdAt" json:"createdAt"`
}

type Image struct {
	URL      string `bson:"url" json:"url"`
	PublicID string `bson:"public_id" json:"public_id"`
}
