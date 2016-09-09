FROM golang:1.7.0-alpine
MAINTAINER Christian Koep <christian.koep@fom-net.de>

RUN apk update && apk add --no-cache \
		git \
		make \
		&& rm -rf /var/lib/apt/lists/* \
		&& git clone --depth 1 -b master https://github.com/zyedidia/micro /usr/src/micro \
		&& cd /usr/src/micro \
		&& make install \
		&& apk del \
			git \
			make

ENTRYPOINT [ "/go/bin/micro" ]
