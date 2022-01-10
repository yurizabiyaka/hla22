package user_posts

import (
	"context"
	"time"

	"github.com/yurizabiyaka/hla22/lab_one_backend/app_model"
	"github.com/yurizabiyaka/hla22/lab_one_backend/db_model"
	"github.com/yurizabiyaka/hla22/lab_one_backend/lab_error"

	//"github.com/kataras/iris/v12/sessions"
	"github.com/google/uuid"
	"github.com/kataras/iris/v12"
)

func ListMyPosts(ctx iris.Context) {
	//session := sessions.Get(ctx)
	localCtx := context.WithValue(ctx.Request().Context(), app_model.USERID_CTX_KEY, "35db0b21-9388-4128-a75b-74a305933165")
	myposts, err := db_model.LoadPosts(localCtx)
	if err != nil {
		ctx.JSON(&lab_error.LabError{
			Failed:       true,
			ErrorCode:    -10, // any db error
			ErrorMessage: err.Error(),
		})
		return
	}
	ctx.JSON(&struct {
		MyPosts []app_model.UserPost `json:"my_posts"`
	}{
		MyPosts: myposts,
	})
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
	newPost := NewUserPost{}
	err := ctx.ReadJSON(&newPost)
	// TIP: use ctx.ReadBody(&b) to bind
	// any type of incoming data instead.
	if err != nil {
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
		UserID:        uuid.New(),
		Text:          newPost.Text,
		Date:          nowDate,
		DateStr:       nowDate.Format(app_model.DATEFORMAT),
		LikesCount:    0,
		CommentsCount: 0,
	}

	localCtx := context.WithValue(ctx.Request().Context(), app_model.USERID_CTX_KEY, userPost.UserID)
	err = db_model.CreatePost(localCtx, userPost)
	if err != nil {
		ctx.JSON(&lab_error.LabError{
			Failed:       true,
			ErrorCode:    -10, // any db error
			ErrorMessage: err.Error(),
		})
		return
	}

	ctx.JSON(&struct {
		NewPost app_model.UserPost `json:"new_post"`
	}{
		NewPost: userPost,
	})
}

// NewUserPost structure of incoming new post created
type NewUserPost struct {
	Text string `json:"text"`
}
