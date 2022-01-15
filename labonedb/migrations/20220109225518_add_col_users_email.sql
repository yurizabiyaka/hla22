-- +goose Up
-- +goose StatementBegin
ALTER TABLE users ADD email VARCHAR(128) NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users DROP email;
-- +goose StatementEnd
