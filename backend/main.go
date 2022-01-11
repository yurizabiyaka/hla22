package main

import (
	"fmt"

	"github.com/yurizabiyaka/hla22/lab_one_backend/app_model"
	"github.com/yurizabiyaka/hla22/lab_one_backend/lab_error"
	"github.com/yurizabiyaka/hla22/lab_one_backend/logger"
	"github.com/yurizabiyaka/hla22/lab_one_backend/login"
	"github.com/yurizabiyaka/hla22/lab_one_backend/user_posts"

	"github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/sessions"
)

const cookieNameForSessionID = "session_id_cookie"

func secret(ctx iris.Context) {
	ctx.WriteString("The cake is a lie!")
}

func getAuthToken(ctx iris.Context) (string, bool) {
	// TODO get it from headers or cookies
	token := ctx.URLParam(app_model.RESPONSE_KEY_AUTHTOKEN)
	return token, len(token) > 0
}

func checkAuth(ctx iris.Context) {
	// Skip OPTIONS preflight requests
	if ctx.Method() == "OPTIONS" {
		logger.Log().Info(fmt.Sprintf("checkAuth: granted OPTIONS request to %s %s", ctx.Request().Method, ctx.RequestPath(true)))

		ctx.Next()
		return
	}

	// Check if user is authenticated
	sess := sessions.Get(ctx)

	switch isAuthenticated := sess.Get(app_model.AUTHENTICATED_CTX_KEY).(type) {
	case bool:
		if !isAuthenticated { // not in sessions, but maybe backend has been restarted since
			if userAuthToken, present := getAuthToken(ctx); present {
				// TODO load token's userID from db
				// (load token with this id AND last_time is not longer than AND status active ) and uptate it's last_time
				isAuthenticated = true
				userID := "ABC"
				sess.Set(app_model.USERID_CTX_KEY, userID)

				logger.Log().Info(fmt.Sprintf("checkAuth: token from db is valid: %s userID is: %s", userAuthToken, userID))
			}
		}
		if isAuthenticated {
			if userId, ok := sess.Get(app_model.USERID_CTX_KEY).(string); ok {
				logger.Log().Info(fmt.Sprintf("checkAuth: authenticated user %s for request %s %s", userId, ctx.Request().Method, ctx.RequestPath(true)))
				ctx.Next()
				return
			}
		}
	default:
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

func addAccessControlAllowOrigin(ctx iris.Context) {
	ctx.ResponseWriter().Header().Add("Access-Control-Allow-Origin", "http://localhost:8080")
	ctx.ResponseWriter().Header().Add("Access-Control-Allow-Credentials", "true")
	ctx.ResponseWriter().Header().Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	ctx.ResponseWriter().Header().Add("Access-Control-Allow-Headers", "Content-Type, Origin, Referer, Accept, User-Agent, Chache-Control, Pragma, Access-Control-Allow-Headers, Authorization, X-Requested-With, Cookie, Content-Length")
	ctx.ResponseWriter().Header().Add("Access-Control-Expose-Headers", "*")
	ctx.ResponseWriter().Header().Add("Allow", "GET, POST, PUT, DELETE, OPTIONS")
	/*
	   res.header('Access-Control-Allow-Methods', '*');
	   res.header('Access-Control-Allow-Headers', '*');
	   Access-Control-Allow-Credentials
	*/
	ctx.Next()
}

func optionsStub(ctx iris.Context) {
	ctx.StatusCode(iris.StatusNoContent)
}

func main() {
	app := iris.New()
	sess := sessions.New(sessions.Config{Cookie: cookieNameForSessionID, AllowReclaim: true})
	app.Use(addAccessControlAllowOrigin, sess.Handler())
	app.Get("/", func(ctx iris.Context) { ctx.Redirect("/v1/logout") })

	v1api := app.Party("/v1")
	{
		// без аутентификации
		v1api.Options("/login", optionsStub)
		v1api.Post("/login", login.Login)
		v1api.Get("/logout", login.Logout)
		v1api.Options("/new_user", optionsStub)
		v1api.Put("/new_user", login.NewUser)

		// с аутентификацией
		v1granted := v1api.Party("/granted")
		v1granted.Use(checkAuth)
		{
			v1granted.Get("/secret", secret)
			v1granted.Get("/myposts", user_posts.ListMyPosts)
			v1granted.Options("/addpost", optionsStub)
			v1granted.Post("/addpost", user_posts.AddPost)
		}
	}

	app.Listen(":8091")
}
