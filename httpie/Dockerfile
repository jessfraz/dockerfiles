FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apk update && apk add \
	ca-certificates \
	python \
	python-dev \
	py-pip \
	build-base \
	&& rm -rf /var/cache/apk/* \
	&& pip install httpie httpie-unixsocket

ENTRYPOINT [ "http" ]
