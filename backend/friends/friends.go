package friends

import (
	"fmt"
	"strconv"

	"github.com/google/uuid"
	"github.com/yurizabiyaka/hla22/lab_one_backend/app_model"
	"github.com/yurizabiyaka/hla22/lab_one_backend/db_model"
	"github.com/yurizabiyaka/hla22/lab_one_backend/lab_error"
	"github.com/yurizabiyaka/hla22/lab_one_backend/logger"

	"github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/sessions"
)

func ListPublicProfiles(ctx iris.Context) {
	if userId, ok := sessions.Get(ctx).Get(app_model.USERID_CTX_KEY).(string); ok {
		from, err1 := strconv.ParseUint(ctx.URLParamDefault("from", "0"), 10, 64)
		quantity, err2 := strconv.ParseUint(ctx.URLParamDefault("quantity", "100"), 10, 64)
		if err1 != nil || err2 != nil {
			err := fmt.Errorf("ListPublicProfiles: failed to parse from/quantity")
			logger.Log().Error(err.Error())
			ctx.JSON(&lab_error.LabError{
				Failed:       true,
				ErrorCode:    -2, // any deserialization error
				ErrorMessage: err.Error(),
			})
			return
		}

		// get from db and convert into front format (with age)
		userProfiles, err := db_model.GetUserProfilesByIndxRange(ctx.Request().Context(), uuid.MustParse(userId), from, quantity, app_model.UserProfileApp2Front)
		if err != nil {
			err := fmt.Errorf("ListPublicProfiles: failed to get profiles: %w", err)
			logger.Log().Error(err.Error())
			ctx.JSON(&lab_error.LabError{
				Failed:       true,
				ErrorCode:    -10, // any db error
				ErrorMessage: err.Error(),
			})
			return
		}

		logger.Log().Info(fmt.Sprintf("ListPublicProfiles: requested from %s, quantity %s, shown %d, quantity %d", ctx.URLParam("from"), ctx.URLParam("quantity"), from, quantity))

		ctx.JSON(&struct {
			UserProfiles []app_model.UserProfile `json:"user_profiles"`
		}{
			UserProfiles: userProfiles,
		})
	}
}

func NewFriendRequest(ctx iris.Context) {
	if userId, ok := sessions.Get(ctx).Get(app_model.USERID_CTX_KEY).(string); ok {

		friendID, err := uuid.Parse(ctx.URLParam("friend_id"))
		if err != nil {
			err := fmt.Errorf("NewFriendRequest: cannot parse friend id %s: %w", friendID, err)
			logger.Log().Error(err.Error())
			ctx.JSON(&lab_error.LabError{
				Failed:       true,
				ErrorCode:    -2, // any deserialization error
				ErrorMessage: err.Error(),
			})
			return
		}

		// get friend info from db
		friendInfo, err := db_model.GetUserByID(ctx.Request().Context(), friendID)
		if err != nil {
			err := fmt.Errorf("NewFriendRequest: cannot get friend info by id %s: %w", friendID, err)
			logger.Log().Error(err.Error())
			ctx.JSON(&lab_error.LabError{
				Failed:       true,
				ErrorCode:    -2, // any deserialization error
				ErrorMessage: err.Error(),
			})
			return
		}

		friendProfile := app_model.UserApp2UserProfileApp(*friendInfo)

		// check if it's me:
		if ctx.URLParam("friend_id") == userId {
			friendProfile.Friendship = app_model.FSITSME
			ctx.JSON(&struct {
				FriendProfile app_model.UserProfile `json:"profile"`
			}{
				FriendProfile: friendProfile,
			})

			return
		}

		err = db_model.CreateFriendRequest(ctx.Request().Context(), uuid.MustParse(userId), friendID)
		if err != nil {
			err := fmt.Errorf("NewFriendRequest: failed to make friends: %w", err)
			logger.Log().Error(err.Error())
			ctx.JSON(&lab_error.LabError{
				Failed:       true,
				ErrorCode:    -10, // any db error
				ErrorMessage: err.Error(),
			})
			return
		}

		logger.Log().Info(fmt.Sprintf("%s has requested friend: %s", userId, ctx.URLParam("friend_id")))

		friendProfile.Friendship = app_model.FSREQUESTED

		ctx.JSON(&struct {
			FriendProfile app_model.UserProfile `json:"profile"`
		}{
			FriendProfile: friendProfile,
		})
	}
}

func ListMyFriends(ctx iris.Context) {
	if userId, ok := sessions.Get(ctx).Get(app_model.USERID_CTX_KEY).(string); ok {
		from, err1 := strconv.ParseUint(ctx.URLParamDefault("from", "0"), 10, 64)
		quantity, err2 := strconv.ParseUint(ctx.URLParamDefault("quantity", "100"), 10, 64)
		if err1 != nil || err2 != nil {
			err := fmt.Errorf("ListMyFriends: failed to parse from/quantity")
			logger.Log().Error(err.Error())
			ctx.JSON(&lab_error.LabError{
				Failed:       true,
				ErrorCode:    -2, // any deserialization error
				ErrorMessage: err.Error(),
			})
			return
		}

		// get from db and convert into front format (with age)
		userProfiles, friendsTotal, err := db_model.GetUserFriendsByRange(ctx.Request().Context(), uuid.MustParse(userId), from, quantity, app_model.UserProfileApp2Front)
		if err != nil {
			err := fmt.Errorf("ListMyFriends: failed to get profiles: %w", err)
			logger.Log().Error(err.Error())
			ctx.JSON(&lab_error.LabError{
				Failed:       true,
				ErrorCode:    -10, // any db error
				ErrorMessage: err.Error(),
			})
			return
		}

		ctx.JSON(&struct {
			FriendsTotal int                     `json:"friends_total"`
			UserProfiles []app_model.UserProfile `json:"user_profiles"`
		}{
			FriendsTotal: friendsTotal,
			UserProfiles: userProfiles,
		})
	}
}
