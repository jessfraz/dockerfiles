FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

ENV HOME /home/gcalcli

RUN apk update && apk add \
	python \
	python-dev \
	py-pip \
	build-base \
	&& rm -rf /var/cache/apk/* \
	&& adduser -S gcalcli \
	&& chown -R gcalcli $HOME \
	&& pip install vobject parsedatetime gcalcli

WORKDIR $HOME
USER gcalcli

ENTRYPOINT [ "gcalcli" ]
