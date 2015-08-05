FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apk update && apk add \
	ca-certificates \
	git \
	python \
	py-boto \
	py-paramiko \
	&& rm -rf /var/cache/apk/*

RUN git clone https://github.com/newsapps/beeswithmachineguns /usr/src/beeswithmachineguns \
	&& cd /usr/src/beeswithmachineguns \
	&& python setup.py install \
	&& rm -rf /usr/src/beeswithmachineguns

ENTRYPOINT [ "bees" ]
