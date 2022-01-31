package app_model

import (
	"time"

	"github.com/google/uuid"
)

type FriendPost struct {
	ID            uuid.UUID   `json:"id"`
	FriendID      uuid.UUID   `json:"friend_id"`
	FriendProfile UserProfile `json:"profile"`
	Text          string      `json:"text"`
	Date          time.Time   `json:"-"`
	DateStr       string      `json:"date_time"`
	LikesCount    uint        `json:"likes_count"`
	CommentsCount uint        `json:"comments_count"`
}
