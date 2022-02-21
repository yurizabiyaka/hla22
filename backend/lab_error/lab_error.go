package lab_error

import "fmt"

type LabError struct {
	Failed       bool   `json:"failed"`
	ErrorCode    int    `json:"error_code"`
	ErrorMessage string `json:"error_message"`
}

func (le LabError) Error() string {
	return fmt.Sprintf("%d: %s", le.ErrorCode, le.ErrorMessage)
}
