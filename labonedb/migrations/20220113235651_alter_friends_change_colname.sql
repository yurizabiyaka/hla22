-- +goose Up
-- +goose StatementBegin
ALTER TABLE friends RENAME COLUMN friedship_state TO friendship_state;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE friends RENAME COLUMN friendship_state TO friendship_state;
-- +goose StatementEnd
