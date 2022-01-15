-- +goose Up
-- +goose StatementBegin
CREATE TABLE authtokens (
    token BINARY(16) NOT NULL,
    state ENUM ('active', 'abandoned'),
    refreshed_at DATETIME,
    lifetime VARCHAR(16) COMMENT 'token lifetime e.g. 1 12:00:00 means one day and a half', 
    user_id BINARY(16) NOT NULL,

    PRIMARY KEY (token)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE authtokens;
-- +goose StatementEnd
