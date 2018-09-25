FROM golang:alpine
MAINTAINER Jessica Frazelle <jess@linux.com>

RUN	apk add --no-cache \
	bash \
	ca-certificates \
	curl \
	git \
	jq \
	make

ENV GO111MODULE on

COPY upload-assets /usr/bin/upload-assets
