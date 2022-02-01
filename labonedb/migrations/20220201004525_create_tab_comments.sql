-- +goose Up
-- +goose StatementBegin
CREATE TABLE comments (
    id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    post_id BINARY(16) NOT NULL,
    text text,
    date_time DATETIME,
    likes_count INT UNSIGNED,
    reply_to BINARY(16),

    PRIMARY KEY(id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE comments;
-- +goose StatementEnd
