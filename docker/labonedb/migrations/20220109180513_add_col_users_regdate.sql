-- +goose Up
-- +goose StatementBegin
ALTER TABLE users ADD registration_date DATETIME NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users DROP registration_date;
-- +goose StatementEnd
