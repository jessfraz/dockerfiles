FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

ENV LANG en_US.UTF-8

RUN apk update && apk add \
	build-base \
	ca-certificates \
	libffi-dev \
	libxml2-dev \
	libxslt-dev \
	openssl-dev \
	python \
	python-dev \
	py-pip \
	&& rm -rf /var/cache/apk/* \
	&& pip install pillow==2.8.0 mitmproxy

CMD [ "mitmproxy" ]
