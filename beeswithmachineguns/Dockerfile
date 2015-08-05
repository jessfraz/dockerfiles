FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apk update && apk add \
	ca-certificates \
	python \
	py-boto \
	py-paramiko \
	py-pip \
	&& rm -rf /var/cache/apk/* \
	&& pip install beeswithmachineguns

ENTRYPOINT [ "beeswithmachineguns" ]
