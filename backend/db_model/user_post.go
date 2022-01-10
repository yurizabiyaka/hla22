package db_model

import (
	"context"
	"time"

	"github.com/yurizabiyaka/hla22/lab_one_backend/app_model"
	lab_dbconnect "github.com/yurizabiyaka/hla22/lab_one_backend/lab_dbconnect"
)

func CreatePost(ctx context.Context, up app_model.UserPost) error {
	userID := ctx.Value(app_model.USERID_CTX_KEY)
	dateStr := up.Date.Format(lab_dbconnect.DateFormat)

	_, err := lab_dbconnect.Conn().ExecContext(ctx,
		"INSERT INTO posts(id, user_id, text, date_time, likes_count, comments_count) "+
			"VALUES (UuidToBin(?),UuidToBin(?),?,?,?,?)", up.ID, userID, up.Text, dateStr, up.LikesCount, up.CommentsCount)
	if err != nil {
		return err
	}
	return nil
}

func LoadPosts(ctx context.Context) ([]app_model.UserPost, error) {
	userID := ctx.Value(app_model.USERID_CTX_KEY)

	rows, err := lab_dbconnect.Conn().QueryContext(ctx,
		"SELECT UuidFromBin(id), UuidFromBin(user_id), text, date_time, likes_count, comments_count "+
			"FROM posts "+
			"WHERE user_id = UuidToBin(?)", userID)
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
