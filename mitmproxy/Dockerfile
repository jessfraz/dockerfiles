FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

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
	&& pip install mitmproxy

CMD [ "mitmproxy" ]
