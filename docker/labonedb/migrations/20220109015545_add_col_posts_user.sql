-- +goose Up
-- +goose StatementBegin
ALTER TABLE posts ADD user_id BINARY(16) NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE posts DROP user_id;
-- +goose StatementEnd
