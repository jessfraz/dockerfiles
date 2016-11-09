FROM alpine:latest
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apk add --no-cache \
	ca-certificates \
	curl \
	libxml2 \
	openssl \
	xclip \
	--repository https://dl-3.alpinelinux.org/alpine/edge/main

RUN set -x \
	&& apk add --no-cache --virtual .build-deps \
		autoconf \
		automake \
		build-base \
		curl-dev \
		git \
		libxml2-dev \
		openssl-dev \
	&& git clone --depth 1 https://github.com/LastPass/lastpass-cli.git /usr/src/lastpass-cli \
	&& ( \
		cd /usr/src/lastpass-cli \
		&& make \
		&& make install \
	) \
	&& rm -rf /usr/src/lastpass-cli \
	&& apk del .build-deps

ENTRYPOINT [ "lpass" ]
