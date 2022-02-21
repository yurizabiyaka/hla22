package check_user

import (
	"context"
	"fmt"

	"github.com/yurizabiyaka/hla22/lab_one_backend/app_model"
	"github.com/yurizabiyaka/hla22/lab_one_backend/db_model"
	"github.com/yurizabiyaka/hla22/lab_one_backend/lab_error"
	"github.com/yurizabiyaka/hla22/lab_one_backend/logger"
	"golang.org/x/crypto/bcrypt"
)

func CheckUserAndPassword(ctx context.Context, username, password string) (*app_model.User, error) {
	appUser, err := db_model.GetUserByEmail(ctx, username)
	if err != nil {
		logger.Log().Error(fmt.Errorf("CheckUserAndPassword: get user %s by email error: %w", username, err).Error())
		return nil, &lab_error.LabError{
			Failed:       true,
			ErrorCode:    -10, // any db error
			ErrorMessage: err.Error(),
		}
	}

	if appUser == nil {
		logger.Log().Info(fmt.Sprintf("CheckUserAndPassword: no such user: %s", username))
		return nil, &lab_error.LabError{
			Failed:       true,
			ErrorCode:    -4, // user not found
			ErrorMessage: "user not found",
		}
	}

	err = bcrypt.CompareHashAndPassword([]byte(appUser.Hash), []byte(password))
	if err != nil {
		logger.Log().Info(fmt.Errorf("CheckUserAndPassword: user %s compare passwords: %w", username, err).Error())
		return nil, &lab_error.LabError{
			Failed:       true,
			ErrorCode:    -4, // passwords not match, let it be -4 also
			ErrorMessage: "user not found",
		}
	}

	return appUser, nil
}
