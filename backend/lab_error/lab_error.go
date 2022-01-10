package lab_error

type LabError struct {
	Failed       bool   `json:"failed"`
	ErrorCode    int    `json:"error_code"`
	ErrorMessage string `json:"error_message"`
}
