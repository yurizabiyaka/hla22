package main

import (
	"github.com/yurizabiyaka/hla22/lab_one_backend/lab_error"
	"github.com/yurizabiyaka/hla22/lab_one_backend/login"
	"github.com/yurizabiyaka/hla22/lab_one_backend/user_posts"

	"github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/sessions"
)

const cookieNameForSessionID = "session_id_cookie"

func secret(ctx iris.Context) {
	ctx.WriteString("The cake is a lie!")
}

func checkAuth(ctx iris.Context) {
	// Skip OPTIONS preflight requests
	if ctx.Method() == "OPTIONS" {
		ctx.Next()
		return
	}
	// Check if user is authenticated
	if auth, _ := sessions.Get(ctx).GetBoolean("authenticated"); !auth {
		ctx.StatusCode(iris.StatusForbidden)
		ctx.JSON(&lab_error.LabError{
			Failed:       true,
			ErrorCode:    -1,
			ErrorMessage: ctx.GetCurrentRoute().Tmpl().Src + ": not authenticated",
		})
		ctx.EndRequest()
		return
	}
	ctx.Next()
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
		v1api.Get("/login", login.Login)
		v1api.Get("/logout", login.Logout)
		v1api.Post("/new_user", login.NewUser)

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
