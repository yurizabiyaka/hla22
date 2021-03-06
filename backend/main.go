package main

import (
	"github.com/yurizabiyaka/hla22/lab_one_backend/authentication"
	"github.com/yurizabiyaka/hla22/lab_one_backend/config"
	"github.com/yurizabiyaka/hla22/lab_one_backend/friends"
	_ "github.com/yurizabiyaka/hla22/lab_one_backend/lab_dbconnect"
	"github.com/yurizabiyaka/hla22/lab_one_backend/login"
	"github.com/yurizabiyaka/hla22/lab_one_backend/user_posts"

	iris "github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/sessions"
)

const cookieNameForSessionID = "session_id_cookie"

func addAccessControlAllowOrigin(ctx iris.Context) {
	ctx.ResponseWriter().Header().Add("Access-Control-Allow-Origin", config.GetCORSOrigin())
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

func main() {
	app := iris.New()
	sess := sessions.New(sessions.Config{Cookie: cookieNameForSessionID, AllowReclaim: true})
	app.Use(sess.Handler())
	//app.Use(addAccessControlAllowOrigin, sess.Handler())
	app.Get("/", func(ctx iris.Context) { ctx.Redirect("/v1/logout") })

	v1api := app.Party("/v1")
	{
		// без аутентификации
		v1api.Options("/login", authentication.OptionsStub)
		v1api.Post("/login", login.Login)

		v1api.Get("/logout", login.Logout)

		v1api.Options("/new_user", authentication.OptionsStub)
		v1api.Put("/new_user", login.NewUser)

		// с аутентификацией
		v1granted := v1api.Party("/granted")
		v1granted.Use(authentication.CheckAuth)
		{
			v1granted.Get("/login_by_creds", login.ByCreds)

			v1granted.Get("/myposts", user_posts.ListMyPosts)
			v1granted.Get("/mynews", user_posts.ListMyNews)

			v1granted.Options("/addpost", authentication.OptionsStub)
			v1granted.Post("/addpost", user_posts.AddPost)

			v1granted.Get("/get_profiles", friends.ListPublicProfiles)

			v1granted.Options("/new_friend_request", authentication.OptionsStub)
			v1granted.Put("/new_friend_request", friends.NewFriendRequest)

			v1granted.Options("/myfriends", authentication.OptionsStub)
			v1granted.Get("/myfriends", friends.ListMyFriends)

			v1granted.Options("/myfriendrequests", authentication.OptionsStub)
			v1granted.Get("/myfriendrequests", friends.ListMyFriendRequests)

			v1granted.Get("/accept_friend_request", friends.AcceptFriendRequest)
		}
	}

	app.Listen(config.GetListenHostAndPort())
}
