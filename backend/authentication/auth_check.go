package authentication

import (
	"fmt"

	"github.com/yurizabiyaka/hla22/lab_one_backend/app_model"
	"github.com/yurizabiyaka/hla22/lab_one_backend/cors_allow"
	"github.com/yurizabiyaka/hla22/lab_one_backend/db_model"
	"github.com/yurizabiyaka/hla22/lab_one_backend/lab_error"
	"github.com/yurizabiyaka/hla22/lab_one_backend/logger"

	"github.com/google/uuid"
	"github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/sessions"
)

func OptionsStub(ctx iris.Context) {
	// allow-origin:
	cors_allow.AddAccessControlAllowOrigin(ctx)

	ctx.StatusCode(iris.StatusNoContent)
}

func GetAuthToken(ctx iris.Context) *uuid.UUID {
	tokenStr := ctx.GetCookie(app_model.RESPONSE_KEY_AUTHTOKEN)

	if len(tokenStr) > 0 {
		token, err := uuid.Parse(tokenStr)
		if err != nil {
			parseErr := fmt.Errorf("getAuthToken cannot parse the token %s: %w", tokenStr, err)
			logger.Log().Error(parseErr.Error())

			return nil
		}
		return &token
	}
	return nil
}

// CheckAuth checks if user is authenticated
func CheckAuth(ctx iris.Context) {
	// Skip OPTIONS preflight requests
	if ctx.Method() == "OPTIONS" {
		logger.Log().Info(fmt.Sprintf("checkAuth: granted CORS %s %s", ctx.Request().Method, ctx.RequestPath(true)))

		ctx.Next()
		return
	}

	sess := sessions.Get(ctx)

	for {
		isAuthenticated, _ := sess.Get(app_model.AUTHENTICATED_CTX_KEY).(bool)
		if !isAuthenticated { // not in sessions, but maybe backend has been restarted since
			if userAuthToken := GetAuthToken(ctx); userAuthToken != nil {
				userID, err := db_model.GetUserIDByTokenAndRefreshToken(ctx.Request().Context(), *userAuthToken)
				if err != nil {
					err := fmt.Errorf("checkAuth: cannot check token %s in db: %w", userAuthToken, err)
					logger.Log().Error(err.Error())
					break
				}
				if userID == nil {
					break
				}

				isAuthenticated = true
				sess.Set(app_model.USERID_CTX_KEY, userID.String())
				sess.Set(app_model.AUTHENTICATED_CTX_KEY, isAuthenticated)

				logger.Log().Info(fmt.Sprintf("checkAuth: token %s is valid, userID is: %s", userAuthToken, userID))
			}
		}
		if isAuthenticated {
			if userIdStr, ok := sess.Get(app_model.USERID_CTX_KEY).(string); ok {
				logger.Log().Info(fmt.Sprintf("checkAuth: authenticated user %s for request %s %s", userIdStr, ctx.Request().Method, ctx.RequestPath(true)))
				ctx.Next()
				return
			}
		}
		break
	}

	logger.Log().Info(fmt.Sprintf("checkAuth: not auth %s %s", ctx.Request().Method, ctx.RequestPath(true)))

	ctx.StatusCode(iris.StatusForbidden)
	ctx.JSON(&lab_error.LabError{
		Failed:       true,
		ErrorCode:    -1,
		ErrorMessage: ctx.GetCurrentRoute().Tmpl().Src + ": not authenticated",
	})
	ctx.EndRequest()
}
