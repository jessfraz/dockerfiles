FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apk add --no-cache \
	ca-certificates \
	gmp \
	libgomp

RUN set -x \
	&& apk add --no-cache --virtual .build-deps \
		build-base \
		gcc \
		git \
		gmp-dev \
		krb5-dev \
		libressl-dev \
		make \
		perl \
	&& git clone --depth 1 https://github.com/magnumripper/JohnTheRipper.git /usr/src/johntheripper \
	&& ( \
		cd /usr/src/johntheripper/src \
		&& ./configure || cat config.log \
		&& make \
		&& cp -r ../run/* /usr/local/bin/ \
	) \
	&& rm -rf /usr/src/johntheripper \
	&& apk del .build-deps

COPY john.ini /root/john.ini
COPY passwd.lst /root/passwd.lst

WORKDIR /root

ENTRYPOINT [ "john" ]
