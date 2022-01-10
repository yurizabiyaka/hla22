-- +goose Up
-- +goose StatementBegin
ALTER TABLE users ADD hash VARCHAR(64) NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users DROP hash
-- +goose StatementEnd
