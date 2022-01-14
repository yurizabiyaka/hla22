-- +goose Up
-- +goose StatementBegin
ALTER TABLE friends DROP PRIMARY KEY, ADD PRIMARY KEY(user_id, friend_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE friends DROP PRIMARY KEY, ADD PRIMARY KEY(user_id);
-- +goose StatementEnd
