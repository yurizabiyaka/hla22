FROM golang:1.17

WORKDIR /go/src/lab_one_backend
COPY . .

RUN go get -d -v ./...
RUN go install -v ./...
RUN go build .

CMD ["lab_one_backend"]