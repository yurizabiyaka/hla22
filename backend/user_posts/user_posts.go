package user_posts

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/yurizabiyaka/hla22/lab_one_backend/app_model"
	"github.com/yurizabiyaka/hla22/lab_one_backend/db_model"
	"github.com/yurizabiyaka/hla22/lab_one_backend/lab_error"
	"github.com/yurizabiyaka/hla22/lab_one_backend/logger"

	"github.com/google/uuid"
	iris "github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/sessions"
)

func ListMyPosts(ctx iris.Context) {
	if userId, ok := sessions.Get(ctx).Get(app_model.USERID_CTX_KEY).(string); ok {
		myposts, err := db_model.LoadPosts(ctx.Request().Context(), uuid.MustParse(userId))
		if err != nil {
			logger.Log().Error(err.Error())
			ctx.JSON(&lab_error.LabError{
				Failed:       true,
				ErrorCode:    -10, // any db error
				ErrorMessage: err.Error(),
			})
			return
		}

		logger.Log().Info(fmt.Sprintf("ListMyPosts: user %s", userId))

		ctx.JSON(&struct {
			MyPosts []app_model.UserPost `json:"my_posts"`
		}{
			MyPosts: myposts,
		})
	}
}

// func generatePosts(num uint) (ret []app_model.UserPost) {
// 	//2006-01-02T15:04
// 	startDate, _ := time.Parse(app_model.DATEFORMAT, "04.05.2019 16:30")
// 	for i := 0; i < int(num); i++ {
// 		likes, _ := rand.Int(rand.Reader, big.NewInt(10000))
// 		comments, _ := rand.Int(rand.Reader, big.NewInt(300))

// 		ret = append(ret, app_model.UserPost{
// 			ID:            uuid.New(),
// 			Text:          lorem.Paragraph(1, 10),
// 			Date:          startDate,
// 			DateStr:       startDate.Format(app_model.DATEFORMAT),
// 			LikesCount:    uint(likes.Int64()),
// 			CommentsCount: uint(comments.Int64()),
// 		})
// 	}
// 	return
// }

func AddPost(ctx iris.Context) {
	if userId, ok := sessions.Get(ctx).Get(app_model.USERID_CTX_KEY).(string); ok {
		newPost := app_model.NewUserPost{}
		err := ctx.ReadJSON(&newPost)
		if err != nil {
			err := fmt.Errorf("AddPost: failed to read json: %w", err)
			logger.Log().Error(err.Error())
			ctx.JSON(&lab_error.LabError{
				Failed:       true,
				ErrorCode:    -2, // any deserialization error
				ErrorMessage: err.Error(),
			})
			return
		}

		nowDate := time.Now()
		userPost := app_model.UserPost{
			ID:            uuid.New(),
			UserID:        uuid.MustParse(userId),
			Text:          newPost.Text,
			Date:          nowDate,
			DateStr:       nowDate.Format(app_model.DATEFORMAT),
			LikesCount:    0,
			CommentsCount: 0,
		}

		localCtx := context.WithValue(ctx.Request().Context(), app_model.USERID_CTX_KEY, userPost.UserID)
		err = db_model.CreatePost(localCtx, userPost.UserID, userPost)
		if err != nil {
			ctx.JSON(&lab_error.LabError{
				Failed:       true,
				ErrorCode:    -10, // any db error
				ErrorMessage: err.Error(),
			})
			return
		}

		logger.Log().Info(fmt.Sprintf("AddPost: user %s", userId))

		ctx.JSON(&struct {
			NewPost app_model.UserPost `json:"new_post"`
		}{
			NewPost: userPost,
		})
	}
}

// ListMyNews
func ListMyNews(ctx iris.Context) {
	if userId, ok := sessions.Get(ctx).Get(app_model.USERID_CTX_KEY).(string); ok {
		from, err1 := strconv.ParseUint(ctx.URLParamDefault("from", "0"), 10, 64)
		quantity, err2 := strconv.ParseUint(ctx.URLParamDefault("quantity", "100"), 10, 64)
		if err1 != nil || err2 != nil {
			err := fmt.Errorf("ListMyNews: failed to parse from/quantity")
			logger.Log().Error(err.Error())
			ctx.JSON(&lab_error.LabError{
				Failed:       true,
				ErrorCode:    -2, // any deserialization error
				ErrorMessage: err.Error(),
			})
			return
		}

		news, err := db_model.LoadNewsByRange(ctx.Request().Context(), uuid.MustParse(userId), from, quantity)
		if err != nil {
			logger.Log().Error(err.Error())
			ctx.JSON(&lab_error.LabError{
				Failed:       true,
				ErrorCode:    -10, // any db error
				ErrorMessage: err.Error(),
			})
			return
		}

		logger.Log().Info(fmt.Sprintf("ListMyNews: user %s", userId))

		ctx.JSON(&struct {
			News []app_model.FriendPost `json:"news"`
		}{
			News: news,
		})
	}
}
