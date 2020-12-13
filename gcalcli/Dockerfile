FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

ENV HOME /home/gcalcli

RUN apk --no-cache add \
	python3 \
	python3-dev \
	build-base \
	&& adduser -S gcalcli \
	&& chown -R gcalcli $HOME \
	&& pip3 install vobject parsedatetime gcalcli

WORKDIR $HOME
USER gcalcli

ENTRYPOINT [ "gcalcli" ]
