FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

ENV HOME /home/gcalcli

RUN apk --no-cache add \
	python \
	python-dev \
	py-pip \
	build-base \
	&& adduser -S gcalcli \
	&& chown -R gcalcli $HOME \
	&& pip install vobject parsedatetime gcalcli

WORKDIR $HOME
USER gcalcli

ENTRYPOINT [ "gcalcli" ]
