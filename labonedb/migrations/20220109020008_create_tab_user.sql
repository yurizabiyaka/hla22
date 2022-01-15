-- +goose Up
-- +goose StatementBegin
CREATE TABLE users (
    id BINARY(16) NOT NULL,
    first_name VARCHAR(24) NOT NULL,
    surname VARCHAR(32) NOT NULL,
    birth_year INT UNSIGNED,
    sex ENUM('male', 'female'),
    interests TEXT,
    city VARCHAR(16),
    registration_date DATETIME,

    PRIMARY KEY(id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE users;
-- +goose StatementEnd
