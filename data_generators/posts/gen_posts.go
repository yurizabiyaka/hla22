package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	//	"github.com/yurizabiyaka/hla22/lab_one_backend/app_model"
	//"github.com/yurizabiyaka/hla22/lab_one_backend/lab_error"

	"github.com/yurizabiyaka/hla22/lab_one_backend/app_model"
	"github.com/yurizabiyaka/hla22/lab_one_backend/lab_error"

	lorem "github.com/drhodes/golorem"
)

func main() {
	var count int
	var userEmail string
	var userPass string
	var backendHostAndPort string
	var delay int

	getHelp1 := flag.Bool("h", false, "display help")
	dryRun := flag.Bool("dry", false, "dry run")
	flag.IntVar(&count, "n", 5, "number of posts to generate")
	flag.IntVar(&delay, "delay", 0, "delay in seconds")
	flag.StringVar(&userEmail, "user", "", "MANDATORY user email")
	flag.StringVar(&userPass, "pass", "", "MANDATORY user pass")
	flag.StringVar(&backendHostAndPort, "backend", "http://localhost:8091", "backend URL like http://localhost:8091")
	flag.Parse()

	if *getHelp1 {
		flag.PrintDefaults()
		return
	}

	fmt.Println("Number of posts to generate:", count)
	fmt.Println("Backend:", backendHostAndPort)
	fmt.Println("User email:", userEmail)
	fmt.Println("User pass:", userPass)
	fmt.Println("Dry-run:", *dryRun)

	if userEmail == "" {
		fmt.Println("User is MANDATORY", userEmail)
		flag.PrintDefaults()
		os.Exit(-1)
	}

	if userPass == "" {
		fmt.Println("Pass is MANDATORY", userPass)
		flag.PrintDefaults()
		os.Exit(-1)
	}

	// login by pass
	// make user struct
	login := app_model.LoginInfo{
		Email:    userEmail,
		Password: userPass,
	}

	loginBytes, err := json.Marshal(login)
	if err != nil {
		err := fmt.Errorf("error when marshalling login: %w", err)
		fmt.Println(err.Error())
		os.Exit(-1)
	}

	// do get request
	loginReq, err := http.NewRequest("POST", backendHostAndPort+"/v1/login", bytes.NewReader(loginBytes))
	if err != nil {
		err := fmt.Errorf("error when composing the login request: %w", err)
		fmt.Println(err.Error())
		os.Exit(-1)
	}

	resp, err := http.DefaultClient.Do(loginReq)
	if err != nil {
		err := fmt.Errorf("error when making the login request: %w", err)
		fmt.Println(err.Error())
		os.Exit(-1)
	}

	// save authtoken
	var authCookie *http.Cookie
	for _, cookie := range resp.Cookies() {
		if cookie.Name == app_model.RESPONSE_KEY_AUTHTOKEN {
			fmt.Println(cookie.Value)
			authCookie = cookie
		}
	}

	// read response
	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		err := fmt.Errorf("error when reading the login response: %w", err)
		fmt.Println(err.Error())
		fmt.Println("body:", string(respBytes))
		resp.Body.Close()
		os.Exit(-2)
	}
	resp.Body.Close()

	userResp := struct {
		lab_error.LabError
		User app_model.User `json:"user"`
	}{}
	err = json.Unmarshal(respBytes, &userResp)
	if err != nil {
		err := fmt.Errorf("error when decoding the login response: %w", err)
		fmt.Println(err.Error())
		fmt.Println("body:", string(respBytes))
		os.Exit(-3)
	}

	if userResp.Failed {
		fmt.Println("FAILED: ", userResp.ErrorMessage)
		os.Exit(-4)
	}

	fmt.Println("SUCCESS: ", userResp.User.ID, authCookie.Value)

	for i := 0; i < count; i++ {
		for {
			fmt.Println("POST", i)

			post := app_model.NewUserPost{
				Text: lorem.Paragraph(1, 10),
			}
			postBytes, err := json.Marshal(post)
			if err != nil {
				err := fmt.Errorf("error when marshalling: %w", err)
				fmt.Println(err.Error())
				os.Exit(-1)
			}

			if *dryRun {
				fmt.Println(string(postBytes))
				break
			}
			// do get request
			postReq, err := http.NewRequest("POST", backendHostAndPort+"/v1/granted/addpost", bytes.NewReader(postBytes))
			if err != nil {
				err := fmt.Errorf("error when composing the request: %w", err)
				fmt.Println(err.Error())
				os.Exit(-1)
			}
			postReq.AddCookie(authCookie)

			resp, err := http.DefaultClient.Do(postReq)
			if err != nil {
				err := fmt.Errorf("error when making the request: %w", err)
				fmt.Println(err.Error())
				os.Exit(-1)
			}

			// read response
			respBytes, err := io.ReadAll(resp.Body)
			if err != nil {
				err := fmt.Errorf("error when reading the response: %w", err)
				fmt.Println(err.Error())
				fmt.Println("body:", string(respBytes))
				resp.Body.Close()
				os.Exit(-2)
			}
			resp.Body.Close()

			postResp := struct {
				lab_error.LabError
				NewPost app_model.UserPost `json:"new_post"`
			}{}
			err = json.Unmarshal(respBytes, &postResp)
			if err != nil {
				err := fmt.Errorf("error when decoding the response: %w", err)
				fmt.Println(err.Error())
				fmt.Println("body:", string(respBytes))
				os.Exit(-3)
			}

			if postResp.Failed {
				fmt.Println("FAILED: ", postResp.ErrorMessage)
				os.Exit(-4)
			}

			fmt.Println("SUCCESS: ", postResp.NewPost.ID)

			if delay > 0 {
				<-time.After(time.Second * time.Duration(delay))
			}
			break
		}
	}

}

// func generatePosts(num uint) (ret []app_model.UserPost) {
// 	//2006-01-02T15:04
// 	startDate, _ := time.Parse(app_model.DATEFORMAT, "04.05.2019 16:30")
// 	for i := 0; i < int(num); i++ {
// 		likes, _ := rand.Int(rand.Reader, big.NewInt(10000))
// 		comments, _ := rand.Int(rand.Reader, big.NewInt(300))

// 		ret = append(ret, app_model.UserPost{
// 			ID:            uuid.New(),
// 			Text:          lorem.Paragraph(1, 10),
// 			Date:          startDate,
// 			DateStr:       startDate.Format(app_model.DATEFORMAT),
// 			LikesCount:    uint(likes.Int64()),
// 			CommentsCount: uint(comments.Int64()),
// 		})
// 	}
// 	return
// }
