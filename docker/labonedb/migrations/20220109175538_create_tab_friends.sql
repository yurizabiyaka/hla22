-- +goose Up
-- +goose StatementBegin
CREATE TABLE friends (
    user_id BINARY(16) NOT NULL,
    friend_id BINARY(16) NOT NULL,
    friedship_state ENUM ('requested', 'acknowledged', 'declined'),
    last_state_date DATETIME,

    PRIMARY KEY (user_id)
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE friends;
-- +goose StatementEnd
