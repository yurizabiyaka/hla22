package db_model

import (
	"context"
	"database/sql"
	"time"

	"github.com/yurizabiyaka/hla22/lab_one_backend/app_model"
	lab_dbconnect "github.com/yurizabiyaka/hla22/lab_one_backend/lab_dbconnect"
)

func GetUserByEmail(ctx context.Context, email string) (*app_model.User, error) {
	row := lab_dbconnect.Conn().QueryRowContext(ctx,
		"SELECT UuidFromBin(id), email, hash, first_name, surname, birth_year, sex, interests, city, registration_date "+
			"FROM users "+
			"WHERE email = ?", email)

	return scanUserRow(row)
}

func scanUserRow(row *sql.Row) (*app_model.User, error) {
	aUser := app_model.User{}
	var birthYearBromDb uint
	var regDateFromDb string

	err := row.Scan(&aUser.ID, &aUser.Email, &aUser.Hash, &aUser.FirstName, &aUser.Surname, &birthYearBromDb, &aUser.Sex, &aUser.Interests, &aUser.City, &regDateFromDb)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	// convert db into app
	aUser.Age = uint8(time.Now().Year() - int(birthYearBromDb))
	aUser.BirthYear = time.Date(int(birthYearBromDb), 0, 0, 0, 0, 0, 0, time.Local)
	aUser.RegistationDate, err = time.Parse(lab_dbconnect.DateFormat, regDateFromDb)
	if err != nil {
		return nil, err
	}

	return &aUser, nil
}

func CreateUser(ctx context.Context, au app_model.User) error {
	birthYearStr := au.BirthYear.Year()
	regDateStr := au.RegistationDate.Format(lab_dbconnect.DateFormat)

	if au.Sex != "male" && au.Sex != "female" {
		au.Sex = "male"
	}

	_, err := lab_dbconnect.Conn().ExecContext(ctx,
		"INSERT INTO users(id, email, hash, first_name, surname, birth_year, sex, interests, city, registration_date) "+
			"VALUES (UuidToBin(?),?,?,?,?,?,?,?,?,?)", au.ID, au.Email, au.Hash, au.FirstName, au.Surname, birthYearStr, au.Sex, au.Interests, au.City, regDateStr)
	if err != nil {
		return err
	}
	return nil
}

func GetUserByID(ctx context.Context) (*app_model.User, error) {

	userID := ctx.Value(app_model.USERID_CTX_KEY)

	row := lab_dbconnect.Conn().QueryRowContext(ctx,
		"SELECT UuidFromBin(id), email, hash, first_name, surname, birth_year, sex, interests, city, registration_date "+
			"FROM users "+
			"WHERE id = UuidToBin(?)", userID)

	return scanUserRow(row)
}
