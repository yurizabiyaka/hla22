package login

import (
	"context"
	"time"

	"github.com/yurizabiyaka/hla22/lab_one_backend/app_model"
	"github.com/yurizabiyaka/hla22/lab_one_backend/db_model"
	"github.com/yurizabiyaka/hla22/lab_one_backend/lab_error"

	"github.com/google/uuid"
	"github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/sessions"
)

func Login(ctx iris.Context) {
	session := sessions.Get(ctx)

	// Authentication goes here
	// ...

	//err := bcrypt.CompareHashAndPassword(hashedPassword, password)

	// Set user as authenticated
	session.Set(app_model.AUTH_CTX_KEY, true)
	ctx.JSON(&struct {
		Authenticated bool `json:"authenticated"`
	}{
		Authenticated: true,
	})
}

func Logout(ctx iris.Context) {
	session := sessions.Get(ctx)

	// Revoke users authentication
	session.Set("authenticated", false)
}

// NewUser is an iris handler which creates a new user in db
func NewUser(ctx iris.Context) {
	frontUser := app_model.User{}
	err := ctx.ReadJSON(&frontUser)
	if err != nil {
		ctx.JSON(&lab_error.LabError{
			Failed:       true,
			ErrorCode:    -2, // any deserialization error
			ErrorMessage: err.Error(),
		})
		return
	}

	// check the user is already exists in db:
	userExisting, err := db_model.GetUserByEmail(ctx.Request().Context(), frontUser.Email)
	if err != nil {
		ctx.JSON(&lab_error.LabError{
			Failed:       true,
			ErrorCode:    -10, // any db error
			ErrorMessage: err.Error(),
		})
		return
	}

	if userExisting != nil {
		ctx.JSON(&lab_error.LabError{
			Failed:       true,
			ErrorCode:    -3, // user already exists
			ErrorMessage: "user already exists",
		})
		return
	}

	// create a new user
	appUser, err := app_model.UserFront2App(frontUser)
	if err != nil {
		ctx.JSON(&lab_error.LabError{
			Failed:       true,
			ErrorCode:    -2, // any deserialization error
			ErrorMessage: err.Error(),
		})
		return
	}
	appUser.ID = uuid.New()
	appUser.RegistationDate = time.Now()

	session := sessions.Get(ctx)
	session.Set(app_model.USERID_CTX_KEY, appUser.ID)
	session.Set(app_model.AUTH_CTX_KEY, true)

	localCtx := context.WithValue(ctx.Request().Context(), app_model.USERID_CTX_KEY, appUser.ID)
	err = db_model.CreateUser(localCtx, appUser)
	if err != nil {
		ctx.JSON(&lab_error.LabError{
			Failed:       true,
			ErrorCode:    -10, // any db error
			ErrorMessage: err.Error(),
		})
		return
	}

	ctx.JSON(&struct {
		User app_model.User `json:"user"`
	}{
		User: appUser,
	})
}
