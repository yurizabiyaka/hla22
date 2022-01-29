package config

import (
	"fmt"

	"github.com/spf13/viper"
	"github.com/yurizabiyaka/hla22/lab_one_backend/logger"
)

type Config struct {
	DBHostAndPort     string `mapstructure:"DB_HOSTANDPORT"`
	DBUser            string `mapstructure:"DB_USER"`
	DBPassword        string `mapstructure:"DB_PASSWORD"`
	DBName            string `mapstructure:"DB_NAME"`
	CORSOrigin        string `mapstructure:"CORS_ORIGIN"`
	ListenHostAndPort string `mapstructure:"LISTEN_HOSTANDPORT"`
}

var config Config

func init() {
	viper.AddConfigPath(".")
	viper.SetConfigType("env") // filename config by default, e.g. config.env

	viper.AutomaticEnv()

	err := viper.ReadInConfig()
	if err != nil {
		logger.Log().Fatal(fmt.Errorf("cannot load config. The config should be placed in the app dir and has name config.env: %w", err).Error())
	}

	err = viper.Unmarshal(&config)
	if err != nil {
		logger.Log().Fatal(fmt.Errorf("cannot read config: %w", err).Error())
	}
}

func GetDBUser() string {
	return config.DBUser
}

func GetDBPassword() string {
	return config.DBPassword
}

func GetDBName() string {
	return config.DBName
}

func GetDBHostAndPort() string {
	return config.DBHostAndPort
}

func GetCORSOrigin() string {
	return config.CORSOrigin
}

func GetListenHostAndPort() string {
	return config.ListenHostAndPort
}
