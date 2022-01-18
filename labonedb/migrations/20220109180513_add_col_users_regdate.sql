-- +goose Up
-- +goose StatementBegin
ALTER TABLE users MODIFY COLUMN registration_date DATETIME NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users MODIFY COLUMN registration_date DATETIME;
-- +goose StatementEnd
