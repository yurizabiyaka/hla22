package app_model

import (
	"time"

	"github.com/google/uuid"
)

type UserPost struct {
	ID            uuid.UUID `json:"id"`
	UserID        uuid.UUID `json:"user_id"`
	Text          string    `json:"text"`
	Date          time.Time `json:"-"`
	DateStr       string    `json:"date_time"`
	LikesCount    uint      `json:"likes_count"`
	CommentsCount uint      `json:"comments_count"`
}
