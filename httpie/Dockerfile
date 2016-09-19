FROM alpine:latest
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apk --no-cache add \
	ca-certificates \
	python \
	py-pip \
	&& pip install httpie httpie-unixsocket

ENTRYPOINT [ "http" ]
