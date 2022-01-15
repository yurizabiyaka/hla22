-- +goose Up
-- +goose StatementBegin
ALTER TABLE users ADD indx BIGINT UNSIGNED, ADD KEY (indx), MODIFY COLUMN indx BIGINT UNSIGNED AUTO_INCREMENT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users DROP indx;
-- +goose StatementEnd
