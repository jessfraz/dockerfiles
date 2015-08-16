# Run glances in a container
# https://github.com/nicolargo/glances
#
# docker run --rm -it \
#	--pid host \
#	--ipc host \
#	--net host \
#	--name glances \
#	jess/glances

FROM alpine:latest

ENV GLANCES_VERSION 2.4.2
RUN apk update && apk add \
	ca-certificates \
	curl \
	gcc \
	python \
	py-pip \
	&& rm -rf /var/cache/apk/*

RUN curl -L "https://github.com/nicolargo/glances/archive/v${GLANCES_VERSION}.tar.gz" -o /tmp/glances.tar.gz \
	&& mkdir -p /usr/src/glances \
	&& tar -xzf /tmp/glances.tar.gz -C /usr/src/glances \
	&& rm /tmp/glances.tar.gz* \
	&& cd /usr/src/glances/glances-${GLANCES_VERSION} \
	&& python setup.py install \
	&& rm -rf /usr/src/glances

ENTRYPOINT [ "glances" ]
