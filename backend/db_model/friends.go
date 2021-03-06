package db_model

import (
	"context"

	lab_dbconnect "github.com/yurizabiyaka/hla22/lab_one_backend/lab_dbconnect"

	"github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
)

func CreateFriendRequest(ctx context.Context, userID, friendID uuid.UUID) error {
	_, err := lab_dbconnect.Conn().ExecContext(ctx,
		"INSERT INTO friends(user_id, friend_id, friendship_state, last_state_date) "+
			"VALUES (UuidToBin(?),UuidToBin(?),'requested',NOW())", userID, friendID)
	if err != nil {
		alreadyExists := false
		if me, ok := err.(*mysql.MySQLError); ok {
			alreadyExists = me.Number == 1062
		}
		if !alreadyExists {
			return err
		}
	}
	return nil
}

func AcceptFriendRequest(ctx context.Context, userID, friendID uuid.UUID) error {
	_, err := lab_dbconnect.Conn().ExecContext(ctx,
		"UPDATE friends SET friendship_state = 'acknowledged', last_state_date = NOW() "+
			"WHERE user_id = UuidToBin(?) AND friend_id = UuidToBin(?)", friendID, userID)
	if err != nil {
		return err
	}
	return nil
}
