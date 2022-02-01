package app_model

import (
	"time"

	"github.com/google/uuid"
)

type FriendPost struct {
	PostID        uuid.UUID `json:"post_id"`
	Text          string    `json:"text"`
	Date          time.Time `json:"-"`
	DateStr       string    `json:"date_time"`
	LikesCount    uint      `json:"likes_count"`
	FriendID      uuid.UUID `json:"friend_id"`
	FriendName    string    `json:"friend_name"`
	FriendSurname string    `json:"friend_surname"`
	CommentsCount uint      `json:"comments_count"`
}
