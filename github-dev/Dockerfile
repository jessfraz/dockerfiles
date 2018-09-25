FROM golang:alpine
MAINTAINER Jessica Frazelle <jess@linux.com>

RUN	apk add --no-cache \
	bash \
	ca-certificates \
	curl \
	gcc \
	git \
	jq \
	make \
	musl-dev

RUN go get github.com/golang/lint/golint
RUN go get honnef.co/go/tools/cmd/staticcheck

ENV GO111MODULE on

COPY upload-assets /usr/bin/upload-assets
