package labdbconnect

import (
	"database/sql"
	"fmt"

	"github.com/yurizabiyaka/hla22/lab_one_backend/config"
	"github.com/yurizabiyaka/hla22/lab_one_backend/logger"

	_ "github.com/go-sql-driver/mysql"
)

//"02.01.2006 15:04"
const DateFormat = "2006-01-02 15:04:05"

var db *sql.DB

func init() {
	var err error
	dbSource := fmt.Sprintf("%s:%s@tcp(%s)/%s", config.GetDBUser(), config.GetDBPassword(), config.GetDBHostAndPort(), config.GetDBName())
	logger.Log().Info(fmt.Sprintf("connecting to %s", dbSource))
	db, err = sql.Open("mysql", dbSource)
	if err != nil {
		panic(err)
	}
	err = db.Ping()
	if err != nil {
		panic(err)
	}
	logger.Log().Info(fmt.Sprintf("connected to %s", dbSource))
}

func Conn() *sql.DB {
	return db
}
