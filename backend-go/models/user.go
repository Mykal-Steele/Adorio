package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type User struct {
	ID         bson.ObjectID   `bson:"_id,omitempty" json:"id"`
	Username   string          `bson:"username" json:"username" validate:"required"`
	Email      string          `bson:"email" json:"email" validate:"required,email"`
	Password   string          `bson:"password" json:"-" validate:"required"`
	RhythmGame RhythmGameStats `bson:"rhythmGame" json:"rhythmGame"`
}
type RhythmGameStats struct {
	PeakPLevel int       `bson:"peakPLevel" json:"peakPLevel"`
	Difficulty string    `bson:"difficulty" json:"difficulty"`
	LastPlayed time.Time `bson:"lastPlayed" json:"lastPlayed"`
}
