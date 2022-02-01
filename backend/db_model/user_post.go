package db_model

import (
	"context"
	"time"

	"github.com/yurizabiyaka/hla22/lab_one_backend/app_model"
	lab_dbconnect "github.com/yurizabiyaka/hla22/lab_one_backend/lab_dbconnect"

	"github.com/google/uuid"
)

func CreatePost(ctx context.Context, userID uuid.UUID, up app_model.UserPost) error {
	dateStr := up.Date.Format(lab_dbconnect.DateFormat)

	_, err := lab_dbconnect.Conn().ExecContext(ctx,
		"INSERT INTO posts(id, user_id, text, date_time, likes_count, comments_count) "+
			"VALUES (UuidToBin(?),UuidToBin(?),?,?,?,?)", up.ID, userID, up.Text, dateStr, up.LikesCount, up.CommentsCount)
	if err != nil {
		return err
	}
	return nil
}

func LoadPosts(ctx context.Context, userID uuid.UUID) ([]app_model.UserPost, error) {
	rows, err := lab_dbconnect.Conn().QueryContext(ctx,
		"SELECT UuidFromBin(id), UuidFromBin(user_id), text, date_time, likes_count, comments_count "+
			"FROM posts "+
			"WHERE user_id = UuidToBin(?) "+
			"ORDER BY date_time DESC", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []app_model.UserPost
	aPost := app_model.UserPost{}
	for rows.Next() {
		err := rows.Scan(&aPost.ID, &aPost.UserID, &aPost.Text, &aPost.DateStr, &aPost.LikesCount, &aPost.CommentsCount)
		if err != nil {
			return nil, err
		}
		// convert db date into app date
		aPost.Date, err = time.Parse(lab_dbconnect.DateFormat, aPost.DateStr)
		if err != nil {
			return nil, err
		}
		aPost.DateStr = aPost.Date.Format(app_model.DATEFORMAT)
		posts = append(posts, aPost)
	}
	err = rows.Close()
	if err != nil {
		return nil, err
	}

	return posts, nil
}

// LoadNews loads all posts from user friends
func LoadNewsByRange(ctx context.Context, userID uuid.UUID, from, quantity uint64) ([]app_model.FriendPost, error) {
	/*
			SELECT UuidFromBin(posts.id), posts.id, posts.text, posts.date_time, posts.likes_count, users.first_name, users.surname, users.id as friend_id,
		 count(comments.id) as comments_total
		FROM users JOIN friends ON users.id = friends.friend_id
		JOIN posts ON posts.user_id = users.id
		LEFT JOIN comments ON comments.post_id = posts.id
		WHERE
		friends.user_id = UuidToBin('49f98291-75f8-4e88-a2d7-58f3bf198309')
		AND
		friends.friendship_state = 'acknowledged'
		GROUP BY posts.id
		ORDER BY posts.date_time DESC
		;*/
	rows, err := lab_dbconnect.Conn().QueryContext(ctx,
		"SELECT UuidFromBin(posts.id), posts.text, posts.date_time, posts.likes_count, "+
			"users.first_name, users.surname, UuidFromBin(users.id) as friend_id, "+
			"count(comments.id) as comments_total "+
			"FROM users JOIN friends ON users.id = friends.friend_id "+
			"JOIN posts ON posts.user_id = users.id "+
			"LEFT JOIN comments ON comments.post_id = posts.id "+
			"WHERE friends.user_id = UuidToBin(?) AND friends.friendship_state = 'acknowledged' "+
			"GROUP BY posts.id "+
			"ORDER BY posts.date_time DESC "+
			"LIMIT ? OFFSET ?", userID, quantity, from)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []app_model.FriendPost
	aPost := app_model.FriendPost{}
	for rows.Next() {
		err := rows.Scan(&aPost.PostID, &aPost.Text, &aPost.DateStr, &aPost.LikesCount, &aPost.FriendName, &aPost.FriendSurname, &aPost.FriendID, &aPost.CommentsCount)
		if err != nil {
			return nil, err
		}
		// convert db date into app date
		aPost.Date, err = time.Parse(lab_dbconnect.DateFormat, aPost.DateStr)
		if err != nil {
			return nil, err
		}
		aPost.DateStr = aPost.Date.Format(app_model.DATEFORMAT)
		posts = append(posts, aPost)
	}
	err = rows.Close()
	if err != nil {
		return nil, err
	}

	return posts, nil
}
