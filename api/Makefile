export CGO_ENABLED=0

.DEFAULT_GOAL := api

fmt:
	go fmt ./...
.PHONY:fmt

lint: fmt
	golint ./...
.PHONY:lint

vet:
	go vet ./src/...
.PHONY:vet

api: vet
	go build -o react-api ./src

clean:
	rm react-api
.PHONY:clean
