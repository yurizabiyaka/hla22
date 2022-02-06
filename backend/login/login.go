package login

import (
	"fmt"
	"time"

	"github.com/yurizabiyaka/hla22/lab_one_backend/app_model"
	"github.com/yurizabiyaka/hla22/lab_one_backend/authentication"
	"github.com/yurizabiyaka/hla22/lab_one_backend/cors_allow"
	"github.com/yurizabiyaka/hla22/lab_one_backend/db_model"
	"github.com/yurizabiyaka/hla22/lab_one_backend/lab_error"
	"github.com/yurizabiyaka/hla22/lab_one_backend/logger"

	"github.com/google/uuid"
	"github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/sessions"
	"golang.org/x/crypto/bcrypt"
)

func Login(ctx iris.Context) {
	session := sessions.Get(ctx)

	// allow-origin:
	cors_allow.AddAccessControlAllowOrigin(ctx)

	loginInfo := app_model.LoginInfo{}
	err := ctx.ReadJSON(&loginInfo)
	if err != nil {
		logger.Log().Error(fmt.Errorf("Login: read json error: %w", err).Error())
		ctx.JSON(&lab_error.LabError{
			Failed:       true,
			ErrorCode:    -2, // any deserialization error
			ErrorMessage: err.Error(),
		})
		return
	}

	appUser, err := db_model.GetUserByEmail(ctx.Request().Context(), loginInfo.Email)
	if err != nil {
		logger.Log().Error(fmt.Errorf("Login: get user %s by email error: %w", loginInfo.Email, err).Error())
		ctx.JSON(&lab_error.LabError{
			Failed:       true,
			ErrorCode:    -10, // any db error
			ErrorMessage: err.Error(),
		})
		return
	}

	if appUser == nil {
		logger.Log().Info(fmt.Sprintf("Login: no such user: %s", loginInfo.Email))
		ctx.JSON(&lab_error.LabError{
			Failed:       true,
			ErrorCode:    -4, // user not found
			ErrorMessage: "user not found",
		})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(appUser.Hash), []byte(loginInfo.Password))
	if err != nil {
		logger.Log().Error(fmt.Errorf("Login: user %s compare passwords: %w", loginInfo.Email, err).Error())
		ctx.JSON(&lab_error.LabError{
			Failed:       true,
			ErrorCode:    -4, // passwords not match, let it be -4 also
			ErrorMessage: "user not found",
		})
		return
	}

	logger.Log().Info(fmt.Sprintf("Login: user %s authenticated", loginInfo.Email))

	// Set user as authenticated:
	session.Set(app_model.USERID_CTX_KEY, appUser.ID.String())
	session.Set(app_model.AUTHENTICATED_CTX_KEY, true)
	authToken := getNewUserAuthToken()

	// set authtoken as a cookie:
	setAuthTokenCookie(ctx, authToken.String())
	// Try to save auth token, proceed if fails:
	err = db_model.CreateAuthToken(ctx.Request().Context(), appUser.ID, authToken, "30 00:00:00")
	if err != nil {
		dbError := fmt.Errorf("Login: cannot save authtoken %s for user %s: %w", authToken, appUser.ID, err)
		logger.Log().Error(dbError.Error())
	}

	ctx.JSON(&struct {
		User app_model.User `json:"user"`
	}{
		User: *appUser,
	})
}

// Logout abandones session auth token
func Logout(ctx iris.Context) {
	session := sessions.Get(ctx)
	
	// allow-origin:
	cors_allow.AddAccessControlAllowOrigin(ctx)

	var validToken string
	if userAuthToken := authentication.GetAuthToken(ctx); userAuthToken != nil {
		validToken = userAuthToken.String()

		err := db_model.AbandonToken(ctx.Request().Context(), *userAuthToken)
		if err != nil {
			err := fmt.Errorf("Logout: failed to abandon token %s: %w", userAuthToken, err)
			logger.Log().Error(err.Error())
		}
	}

	// Revoke users authentication
	session.Set(app_model.AUTHENTICATED_CTX_KEY, false)
	ctx.RemoveCookie(app_model.RESPONSE_KEY_AUTHTOKEN)

	logger.Log().Info(fmt.Sprintf("Logout: token %s logged out", validToken))

	ctx.JSON(&lab_error.LabError{
		Failed:       false,
		ErrorCode:    0, // any db error
		ErrorMessage: "Logout success",
	})
}

// ByCreds invokes user info by active session token
func ByCreds(ctx iris.Context) {
	session := sessions.Get(ctx)

	// allow-origin:
	cors_allow.AddAccessControlAllowOrigin(ctx)

	if userAuthToken := authentication.GetAuthToken(ctx); userAuthToken != nil {
		userID, err := db_model.GetUserIDByTokenAndRefreshToken(ctx.Request().Context(), *userAuthToken)
		if err != nil {
			err := fmt.Errorf("ByCreds: failed to get userID by token %s: %w", userAuthToken, err)
			logger.Log().Error(err.Error())
			ctx.JSON(&lab_error.LabError{
				Failed:       true,
				ErrorCode:    -10, // any db error
				ErrorMessage: err.Error(),
			})
			return
		}

		user, err := db_model.GetUserByID(ctx.Request().Context(), *userID)
		if err != nil {
			err := fmt.Errorf("ByCreds: failed to get userID by userID %s: %w", userID, err)
			logger.Log().Error(err.Error())
			ctx.JSON(&lab_error.LabError{
				Failed:       true,
				ErrorCode:    -10, // any db error
				ErrorMessage: err.Error(),
			})
			return
		}

		logger.Log().Info(fmt.Sprintf("ByCreds: user %s authenticated", user.Email))

		session.Set(app_model.AUTHENTICATED_CTX_KEY, true)
		session.Set(app_model.USERID_CTX_KEY, userID.String())
		ctx.JSON(&struct {
			User app_model.User `json:"user"`
		}{
			User: *user,
		})
	}
}

// NewUser is an iris handler which creates a new user in db
func NewUser(ctx iris.Context) {
	// allow-origin:
	cors_allow.AddAccessControlAllowOrigin(ctx)

	frontUser := app_model.User{}
	err := ctx.ReadJSON(&frontUser)
	if err != nil {
		logger.Log().Error(fmt.Errorf("NewUser: read json error: %w", err).Error())
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
		logger.Log().Error(fmt.Errorf("NewUser: get user %s by email error: %w", frontUser.Email, err).Error())
		ctx.JSON(&lab_error.LabError{
			Failed:       true,
			ErrorCode:    -10, // any db error
			ErrorMessage: err.Error(),
		})
		return
	}

	if userExisting != nil {
		logger.Log().Info(fmt.Sprintf("NewUser: user %s already exists", frontUser.Email))
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
		logger.Log().Error(fmt.Errorf("NewUser: user %s convert error: %w", frontUser.Email, err).Error())
		ctx.JSON(&lab_error.LabError{
			Failed:       true,
			ErrorCode:    -2, // any deserialization error
			ErrorMessage: err.Error(),
		})
		return
	}
	appUser.ID = uuid.New()
	appUser.RegistationDate = time.Now()

	err = db_model.CreateUser(ctx.Request().Context(), appUser)
	if err != nil {
		logger.Log().Error(fmt.Errorf("NewUser: cannot create user %s: %w", frontUser.Email, err).Error())
		ctx.JSON(&lab_error.LabError{
			Failed:       true,
			ErrorCode:    -10, // any db error
			ErrorMessage: err.Error(),
		})
		return
	}

	logger.Log().Info(fmt.Sprintf("NewUser: user %s created", frontUser.Email))

	session := sessions.Get(ctx)
	session.Set(app_model.USERID_CTX_KEY, appUser.ID.String())
	session.Set(app_model.AUTHENTICATED_CTX_KEY, true)
	authToken := getNewUserAuthToken()
	// set authtoken as a cookie:
	setAuthTokenCookie(ctx, authToken.String())
	// Try to save auth token, proceed if fails:
	err = db_model.CreateAuthToken(ctx.Request().Context(), appUser.ID, authToken, "30 00:00:00")
	if err != nil {
		dbError := fmt.Errorf("NewUser: cannot save authtoken %s for user %s: %w", authToken, appUser.ID, err)
		logger.Log().Error(dbError.Error())
	}

	ctx.JSON(&struct {
		User app_model.User `json:"user"`
	}{
		User: appUser,
	})
}

func setAuthTokenCookie(ctx iris.Context, token string) {
	ctx.SetCookieKV(app_model.RESPONSE_KEY_AUTHTOKEN, token)
}

func getNewUserAuthToken() uuid.UUID {
	return uuid.New()
}
