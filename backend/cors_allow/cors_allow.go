package cors_allow

import (
	"github.com/yurizabiyaka/hla22/lab_one_backend/config"

	"github.com/kataras/iris/v12"
)

func AddAccessControlAllowOrigin(ctx iris.Context) {
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
}
