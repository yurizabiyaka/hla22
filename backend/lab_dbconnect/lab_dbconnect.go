package labdbconnect

import (
	"database/sql"

	_ "github.com/go-sql-driver/mysql"
)

//"02.01.2006 15:04"
const DateFormat = "2006-01-02 15:04:05"

var db *sql.DB

func init() {
	var err error
	db, err = sql.Open("mysql", "dbuser:dbpass@tcp(mariadb:3306)/labonedb")
	if err != nil {
		panic(err)
	}
}

func Conn() *sql.DB {
	return db
}
