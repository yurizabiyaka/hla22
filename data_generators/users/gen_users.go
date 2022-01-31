package main

import (
	"bytes"
	"crypto/rand"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"math/big"
	"net/http"
	"os"

	"github.com/yurizabiyaka/hla22/lab_one_backend/app_model"
	"github.com/yurizabiyaka/hla22/lab_one_backend/lab_error"
)

var (
	NameParts = []string{
		"Che", "Zhi", "So", "Rumi", "Lapo", "Kis", "Rot", "Maru", "Sor", "Di", "Situ", "Wee", "Ngon", "Igo",
		"Su", "Depo", "Anzhi", "Okko", "Esta", "Pi", "Ratu", "Ever", "Miso", "Ku", "Isto", "Ama", "Rica",
		"Lando", "Asta", "Ursa", "Ocu", "Ree", "Vi", "Lista", "Bu", "Luti", "Az", "Vera", "Yula", "Ico",
	}
	EmailDomains = []string{
		"outlook.com", "gmail.com", "yahoo.com", "inbox.com", "icloud.apple", "mail.com", "aol.usa", "zoho.com",
		"yandex.ru", "ya.com", "proton.net", "anet.net", "curio-city.com", "excite.co.jp", "post.expart.ne.jp",
		"mail.goo.ne.jp", "mail.yahoo.co.jp", "валенки.рф",
	}
	Interests = []string{
		"computers", "highload", "insects", "aliens", "microcontrollers", "diys", "shopping", "games", "travel",
		"reading", "books", "scy-fi", "hi-fi", "wi-fi", "laptops", "gadgets", "tv", "shoes", "cloth", "clocks",
		"rare old things", "kids", "school", "apple", "xiaomi", "home supplies", "reading", "wingsuits",
	}
	Cities = []string{
		"Москва", "Курск", "Питер", "Брянск", "Орёл", "Калуга", "Нижний Новгород", "Тула", "Ярославль", "Белгород",
		"Lima", "Dallas", "Huston", "NY", "LA", "SF", "Chikago", "Tokio", "Barselona", "Shanghai", "Uhan", "Shengzhen",
		"Vancouver", "Ostin", "Paris", "London", "Deli", "Mexico", "Kanberra", "Istambul",
	}
)

func main() {
	var count int
	var backendHostAndPort string

	getHelp1 := flag.Bool("h", false, "display help")
	dryRun := flag.Bool("dry", false, "dry run")
	flag.IntVar(&count, "n", 1123, "number of users to generate")
	flag.StringVar(&backendHostAndPort, "backend", "http://localhost:8091", "backend URL like http://localhost:8091")
	flag.Parse()

	if *getHelp1 {
		flag.PrintDefaults()
		return
	}

	fmt.Println("Number of new users to generate:", count)
	fmt.Println("Backend:", backendHostAndPort)

	for i := 0; i < count; i++ {
		surName := generateWord(3, NameParts)

		sex := "male"
		sexDet := GetRand(10)
		if sexDet >= 5 {
			sex = "female"
		}

		user := app_model.User{
			FirstName: generateWord(2, NameParts),
			Surname:   surName,
			Email:     generateEmail(surName, EmailDomains),
			Password:  "444",
			Age:       uint8(GetRand(80)),
			Sex:       sex,
			Interests: generateList(Interests),
			City:      generateWord(1, Cities),
		}

		for {
			// make user struct
			userBytes, err := json.Marshal(user)
			if err != nil {
				err := fmt.Errorf("error when reading the response: %w", err)
				fmt.Println(err.Error())
				break
			}

			fmt.Println(string(userBytes))

			// do put request
			putRequest, err := http.NewRequest("PUT", backendHostAndPort+"/v1/new_user", bytes.NewReader(userBytes))
			if err != nil {
				err := fmt.Errorf("error when composing the request: %w", err)
				fmt.Println(err.Error())
				os.Exit(-1)
			}

			if *dryRun {
				break
			}

			resp, err := http.DefaultClient.Do(putRequest)
			if err != nil {
				err := fmt.Errorf("error when making the request: %w", err)
				fmt.Println(err.Error())
				os.Exit(-1)
			}

			// save authtoken
			for _, cookie := range resp.Cookies() {
				if cookie.Name == app_model.RESPONSE_KEY_AUTHTOKEN {
					fmt.Println(cookie.Value)
				}
			}

			// read response
			respBytes, err := io.ReadAll(resp.Body)
			if err != nil {
				err := fmt.Errorf("error when reading the response: %w", err)
				fmt.Println(err.Error())
				resp.Body.Close()
				break
			}
			resp.Body.Close()

			userResp := struct {
				lab_error.LabError
				User app_model.User `json:"user"`
			}{}
			err = json.Unmarshal(respBytes, &userResp)
			if err != nil {
				err := fmt.Errorf("error when decoding the response: %w", err)
				fmt.Println(err.Error())
				break
			}

			if userResp.Failed {
				fmt.Println(i, "FAILED: ", userResp.ErrorMessage)
				break
			}

			fmt.Println(i, "SUCCESS: ", userResp.User.ID)

			break
		}
	}
}

func generateWord(lengthInParts int, parts []string) string {
	var word string

	for i := 0; i < lengthInParts; i++ {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(parts))))
		if err != nil {
			os.Exit(-2)
		}
		word += parts[int(n.Int64())]
	}
	return word
}

func generateEmail(user string, domains []string) string {

	n, err := rand.Int(rand.Reader, big.NewInt(int64(len(domains))))
	if err != nil {
		os.Exit(-2)
	}

	return user + "@" + domains[int(n.Int64())]
}

func generateList(parts []string) string {
	var word string
	length, err := rand.Int(rand.Reader, big.NewInt(int64(len(parts))))
	if err != nil {
		os.Exit(-2)
	}

	for i := 0; i < int(length.Int64()/2+1); i++ {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(parts))))
		if err != nil {
			os.Exit(-2)
		}
		if i != 0 {
			word += ", "
		}
		word += parts[int(n.Int64())]
	}
	return word
}

func GetRand(upTo int) int {
	n, err := rand.Int(rand.Reader, big.NewInt(int64(upTo)))
	if err != nil {
		os.Exit(-2)
	}
	return int(n.Int64())
}
