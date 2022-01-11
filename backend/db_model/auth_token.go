package db_model

import (
	"context"
	"database/sql"
	"fmt"

	lab_dbconnect "github.com/yurizabiyaka/hla22/lab_one_backend/lab_dbconnect"
	"github.com/yurizabiyaka/hla22/lab_one_backend/logger"

	"github.com/google/uuid"
)

func CreateAuthToken(ctx context.Context, userID uuid.UUID, authToken uuid.UUID, lifetime string) error {
	_, err := lab_dbconnect.Conn().ExecContext(ctx,
		"INSERT INTO authtokens(token, state, refreshed_at, lifetime, user_id) "+
			"VALUES (UuidToBin(?),'active',NOW(),?,UuidToBin(?))", authToken, lifetime, userID)
	if err != nil {
		return err
	}
	return nil
}

func AbandonToken(_ context.Context, authToken uuid.UUID) error {
	_, err := lab_dbconnect.Conn().Exec(
		"UPDATE authtokens "+
			"SET state = 'abandoned' "+
			"WHERE token = UuidToBin(?)", authToken)
	if err != nil {
		return err
	}
	return nil
}

func GetUserIDByTokenAndRefreshToken(ctx context.Context, authToken uuid.UUID) (userID *uuid.UUID, retErr error) {
	tx, err := lab_dbconnect.Conn().Begin()
	if err != nil {
		return nil, err
	}

	performRallback := func(errText string) {
		rollbackErr := tx.Rollback()
		if rollbackErr != nil {
			rollbackErr := fmt.Errorf("%s: %w", errText, rollbackErr)
			logger.Log().Error(rollbackErr.Error())
		}
	}

	// select one row
	row := tx.QueryRowContext(ctx,
		"SELECT UuidFromBin(user_id) "+
			"FROM authtokens "+
			"WHERE token = UuidToBin(?) AND state = 'active' AND ADDTIME(refreshed_at, lifetime) >= NOW()", authToken)

	var userIDObj uuid.UUID
	err = row.Scan(&userIDObj)
	if err != nil {
		if err == sql.ErrNoRows {
			performRallback("GetUserByTokenAndRefresh rollback no rows")
			return nil, nil
		}

		performRallback("GetUserByTokenAndRefresh rollback on select")
		return nil, err
	}

	userID = &userIDObj

	// update
	_, err = lab_dbconnect.Conn().ExecContext(ctx,
		"UPDATE authtokens "+
			"SET refreshed_at = NOW() "+
			"WHERE token = UuidToBin(?)", authToken)
	if err != nil {
		updateErr := fmt.Errorf("GetUserByTokenAndRefresh cannot refresh token %s for user %s: %w", authToken, userID, err)
		logger.Log().Error(updateErr.Error())

		performRallback("GetUserByTokenAndRefresh rollback on update")
		return
	}

	commitErr := tx.Commit()
	if commitErr != nil {
		commitErr := fmt.Errorf("GetUserByTokenAndRefresh commit error: %w", commitErr)
		logger.Log().Error(commitErr.Error())

		return
	}

	return
}
