-- +goose Up
-- +goose StatementBegin
CREATE FUNCTION UuidToBin(_uuid BINARY(36))
    RETURNS BINARY(16)
    LANGUAGE SQL  DETERMINISTIC  CONTAINS SQL  SQL SECURITY INVOKER
RETURN
    UNHEX(CONCAT(
        SUBSTR(_uuid, 15, 4),
        SUBSTR(_uuid, 10, 4),
        SUBSTR(_uuid,  1, 8),
        SUBSTR(_uuid, 20, 4),
        SUBSTR(_uuid, 25) ));
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP FUNCTION UuidToBin;
-- +goose StatementEnd