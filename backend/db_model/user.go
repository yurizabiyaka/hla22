package db_model

import (
	"context"
	"database/sql"
	"time"

	"github.com/yurizabiyaka/hla22/lab_one_backend/app_model"
	lab_dbconnect "github.com/yurizabiyaka/hla22/lab_one_backend/lab_dbconnect"

	"github.com/google/uuid"
)

func GetUserByEmail(ctx context.Context, email string) (*app_model.User, error) {
	row := lab_dbconnect.Conn().QueryRowContext(ctx,
		"SELECT UuidFromBin(id), email, hash, first_name, surname, birth_year, sex, interests, city, registration_date, indx "+
			"FROM users "+
			"WHERE email = ?", email)

	return scanUserRow(row)
}

func scanUserRow(row *sql.Row) (*app_model.User, error) {
	aUser := app_model.User{}
	var birthYearBromDb uint
	var regDateFromDb string

	err := row.Scan(&aUser.ID, &aUser.Email, &aUser.Hash, &aUser.FirstName, &aUser.Surname, &birthYearBromDb, &aUser.Sex, &aUser.Interests, &aUser.City, &regDateFromDb, &aUser.Indx)

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

func GetUserByID(ctx context.Context, userID uuid.UUID) (*app_model.User, error) {

	row := lab_dbconnect.Conn().QueryRowContext(ctx,
		"SELECT UuidFromBin(id), email, hash, first_name, surname, birth_year, sex, interests, city, registration_date, indx "+
			"FROM users "+
			"WHERE id = UuidToBin(?)", userID)

	return scanUserRow(row)
}

func GetUserProfilesByIndxRange(ctx context.Context, userID uuid.UUID, from, quantity uint64, opts func(app_model.UserProfile) app_model.UserProfile) ([]app_model.UserProfile, error) {
	rows, err := lab_dbconnect.Conn().QueryContext(ctx,
		"SELECT indx, UuidFromBin(id), first_name, surname, birth_year, sex, interests, city, friendship_state "+
			"FROM users LEFT JOIN friends ON id = friend_id AND user_id = UuidToBin(?) "+
			"WHERE indx BETWEEN ? AND ? ", userID, from, from+quantity-1)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return collectUserProfiles(rows, userID, opts)
}

func scanUserProfileRow(rows *sql.Rows) (*app_model.UserProfile, error) {
	aUser := app_model.UserProfile{}
	var birthYearBromDb uint
	var friendshipState sql.NullString

	err := rows.Scan(&aUser.Index, &aUser.ID, &aUser.FirstName, &aUser.Surname, &birthYearBromDb, &aUser.Sex, &aUser.Interests, &aUser.City, &friendshipState)

	if err != nil {
		return nil, err
	}

	aUser.BirthYear = time.Date(int(birthYearBromDb), 0, 0, 0, 0, 0, 0, time.Local)
	aUser.FriendshipDb = friendshipState.String

	appUser := userProfileDb2App(aUser)

	return &appUser, nil
}

func collectUserProfiles(rows *sql.Rows, userID uuid.UUID, opts func(app_model.UserProfile) app_model.UserProfile) ([]app_model.UserProfile, error) {
	var profiles []app_model.UserProfile
	for rows.Next() {
		profile, err := scanUserProfileRow(rows)
		if err != nil {
			return nil, err
		}
		if profile != nil {
			if profile.ID == userID {
				profile.Friendship = app_model.FSITSME
			}
			profiles = append(profiles, opts(*profile))
		}
	}
	return profiles, nil
}

// UserProfileDb2App converts friendship state and age
func userProfileDb2App(dbProfile app_model.UserProfile) (appProfile app_model.UserProfile) {
	appProfile = dbProfile

	switch dbProfile.FriendshipDb {
	case "requested":
		appProfile.Friendship = app_model.FSREQUESTED
	case "acknowledged":
		appProfile.Friendship = app_model.FSACCEPTED
	case "declined":
		appProfile.Friendship = app_model.FSDECLINED
	default:
		appProfile.Friendship = app_model.FSNONE
	}

	return
}

// GetUserFriendsByRange gets friends by pages
func GetUserFriendsByRange(ctx context.Context, userID uuid.UUID, from, quantity uint64, opts func(app_model.UserProfile) app_model.UserProfile) ([]app_model.UserProfile, int, error) {
	rows, err := lab_dbconnect.Conn().QueryContext(ctx,
		"SELECT indx, UuidFromBin(id), first_name, surname, birth_year, sex, interests, city, friendship_state "+
			"FROM users JOIN friends ON id = friend_id AND user_id = UuidToBin(?) "+
			"ORDER BY first_name", userID)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	profiles, err := collectUserProfiles(rows, userID, opts)
	if err != nil {
		return nil, 0, err
	}

	firstIndex := int(from)
	if firstIndex < 0 {
		firstIndex = 0
	}
	quant := int(quantity)
	lastIndex := firstIndex + quant

	if lastIndex < 0 || lastIndex > len(profiles) {
		lastIndex = len(profiles)
	}

	return profiles[firstIndex:lastIndex], len(profiles), nil
}
