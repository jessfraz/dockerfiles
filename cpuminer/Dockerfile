FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apk add --no-cache \
	ca-certificates \
	curl \
	libressl

ENV CPUMINER_VERSION v2.5.0
RUN set -x \
	&& apk add --no-cache --virtual .build-deps \
		autoconf \
		automake \
		build-base \
		curl-dev \
		git \
	&& git clone --depth 1 --branch "${CPUMINER_VERSION}" https://github.com/pooler/cpuminer.git /usr/src/cpuminer \
	&& ( \
	cd /usr/src/cpuminer \
	&& ./autogen.sh \
	&& ./configure CFLAGS="-O3" \
	&& make \
	&& make install \
	) \
	&& rm -rf /usr/src/cpuminer \
	&& apk del .build-deps

ENTRYPOINT [ "minerd" ]
