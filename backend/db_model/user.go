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
			"LIMIT ? OFFSET ? ", userID, quantity, from)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return collectUserProfiles(rows, userID, scanUserProfileRow, opts)
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

// collectUserProfiles calls collector scanRow for each row in rows to scan values,
// and then applies opts for the profile to adopt db field values for application needs
func collectUserProfiles(rows *sql.Rows, userID uuid.UUID, scanRow func(rows *sql.Rows) (*app_model.UserProfile, error),
	opts func(app_model.UserProfile) app_model.UserProfile) ([]app_model.UserProfile, error) {
	var profiles []app_model.UserProfile
	for rows.Next() {
		profile, err := scanRow(rows)
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
		"SELECT indx, UuidFromBin(id), first_name, surname, birth_year, sex, interests, city, friendship_state, "+
			"count(*) OVER() AS full_count "+
			"FROM users JOIN friends ON id = friend_id AND user_id = UuidToBin(?) "+
			"ORDER BY first_name LIMIT ? OFFSET ?", userID, quantity, from)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var localTotalFriends int

	profiles, err := collectUserProfiles(rows, userID, func(rows *sql.Rows) (*app_model.UserProfile, error) {
		aUser := app_model.UserProfile{}
		var birthYearBromDb uint
		var friendshipState sql.NullString
		var totalFriends int

		err := rows.Scan(&aUser.Index, &aUser.ID, &aUser.FirstName, &aUser.Surname, &birthYearBromDb, &aUser.Sex, &aUser.Interests, &aUser.City, &friendshipState, &totalFriends)

		if err != nil {
			return nil, err
		}

		aUser.BirthYear = time.Date(int(birthYearBromDb), 0, 0, 0, 0, 0, 0, time.Local)
		aUser.FriendshipDb = friendshipState.String

		appUser := userProfileDb2App(aUser)

		localTotalFriends = totalFriends

		return &appUser, nil
	}, opts)
	if err != nil {
		return nil, 0, err
	}

	return profiles, localTotalFriends, nil
}

// GetUserFriendRequestsByRange gets friend requests by pages
func GetUserFriendRequestsByRange(ctx context.Context, userID uuid.UUID, from, quantity uint64, opts func(app_model.UserProfile) app_model.UserProfile) ([]app_model.UserProfile, int, error) {
	rows, err := lab_dbconnect.Conn().QueryContext(ctx,
		"SELECT indx, UuidFromBin(id), first_name, surname, birth_year, sex, interests, city, friendship_state, "+
			"count(*) OVER() AS full_count "+
			"FROM users JOIN friends ON id = user_id AND friend_id = UuidToBin(?) "+
			"ORDER BY first_name LIMIT ? OFFSET ?", userID, quantity, from)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var localTotalFriends int

	profiles, err := collectUserProfiles(rows, userID, func(rows *sql.Rows) (*app_model.UserProfile, error) {
		aUser := app_model.UserProfile{}
		var birthYearBromDb uint
		var friendshipState sql.NullString
		var totalFriends int

		err := rows.Scan(&aUser.Index, &aUser.ID, &aUser.FirstName, &aUser.Surname, &birthYearBromDb, &aUser.Sex, &aUser.Interests, &aUser.City, &friendshipState, &totalFriends)

		if err != nil {
			return nil, err
		}

		aUser.BirthYear = time.Date(int(birthYearBromDb), 0, 0, 0, 0, 0, 0, time.Local)
		aUser.FriendshipDb = friendshipState.String

		appUser := userProfileDb2App(aUser)

		localTotalFriends = totalFriends

		return &appUser, nil
	}, opts)
	if err != nil {
		return nil, 0, err
	}

	return profiles, localTotalFriends, nil
}
