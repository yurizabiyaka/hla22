-- +goose Up
-- +goose StatementBegin
CREATE TABLE posts (
    id BINARY(16) NOT NULL,
    text text,
    date_time DATETIME,
    likes_count INT UNSIGNED,
    comments_count INT UNSIGNED,

    PRIMARY KEY(id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE posts;
-- +goose StatementEnd
