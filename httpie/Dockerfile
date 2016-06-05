FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apk --no-cache add \
	ca-certificates \
	python \
	py-pip \
	&& pip install httpie httpie-unixsocket

ENTRYPOINT [ "http" ]
