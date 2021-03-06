package app_model

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

const (
	USMALE   = "male"
	USFEMALE = "female"
)

type User struct {
	ID              uuid.UUID `json:"id"`
	FirstName       string    `json:"first_name"`
	Surname         string    `json:"surname"`
	Email           string    `json:"email"`
	Password        string    `json:"password"`
	Hash            []byte    `json:"-"`
	BirthYear       time.Time `json:"-"`
	Age             uint8     `json:"age"`
	Sex             string    `json:"sex"`
	Interests       string    `json:"interests"`
	City            string    `json:"city"`
	RegistationDate time.Time `json:"-"`
	Indx            uint64    `json:"-"`
}

// UserFront2App converts user entity: front sends Age, which should be converted into BirthYear
func UserFront2App(frontUser User) (appUser User, err error) {
	appUser.FirstName = frontUser.FirstName
	appUser.Surname = frontUser.Surname
	appUser.Email = frontUser.Email

	if len(frontUser.Password) == 0 {
		return appUser, fmt.Errorf("password not set")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(frontUser.Password), bcrypt.DefaultCost)
	if err != nil {
		return appUser, err
	}
	appUser.Hash = hash

	// calc birth year
	appUser.BirthYear = time.Date(time.Now().Year()-int(frontUser.Age), 0, 0, 0, 0, 0, 0, time.Local)
	appUser.Age = frontUser.Age
	appUser.Sex = USMALE
	if strings.EqualFold(frontUser.Sex, USMALE) || strings.EqualFold(frontUser.Sex, USFEMALE) {
		appUser.Sex = strings.ToLower(frontUser.Sex)
	}
	appUser.Interests = frontUser.Interests
	appUser.City = frontUser.City

	return appUser, nil
}

type FriendshipState string

const (
	FSNONE      FriendshipState = "none"
	FSREQUESTED FriendshipState = "requested"
	FSACCEPTED  FriendshipState = "accepted"
	FSDECLINED  FriendshipState = "declined"
	FSITSME     FriendshipState = "itsme"
)

type UserProfile struct {
	Index        uint64          `json:"index"`
	ID           uuid.UUID       `json:"id"`
	FirstName    string          `json:"first_name"`
	Surname      string          `json:"surname"`
	BirthYear    time.Time       `json:"-"`
	Age          uint8           `json:"age"`
	Sex          string          `json:"sex"`
	Interests    string          `json:"interests"`
	City         string          `json:"city"`
	Friendship   FriendshipState `json:"friendship"`
	FriendshipDb string          `json:"-"`
}

// UserProfileApp2Front converts age
func UserProfileApp2Front(app UserProfile) (front UserProfile) {
	front = app
	front.Age = uint8(time.Now().Year() - int(app.BirthYear.Year()))

	return
}

func UserApp2UserProfileApp(user User) UserProfile {
	profile := UserProfile{
		Index:        user.Indx,
		ID:           user.ID,
		FirstName:    user.FirstName,
		Surname:      user.Surname,
		BirthYear:    user.BirthYear,
		Age:          user.Age,
		Sex:          user.Sex,
		Interests:    user.Interests,
		City:         user.City,
		Friendship:   FSNONE,
		FriendshipDb: "",
	}
	return profile
}
