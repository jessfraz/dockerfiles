FROM debian:stretch
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	libgmp10 \
	libgomp1 \
	libkrb5-3 \
	libnss3 \
	libssl1.0.2 \
	openssl \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN buildDeps=' \
		ca-certificates \
		gcc \
		git \
		libgmp-dev \
		libkrb5-dev \
		libnss3-dev \
		libssl-dev \
		make \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& git clone https://github.com/magnumripper/JohnTheRipper.git /usr/src/johntheripper \
	&& cd /usr/src/johntheripper/src \
	&& ./configure \
	&& make \
	&& cp -r ../run/* /usr/local/bin/ \
	&& rm -rf /usr/src/johntheripper \
	&& apt-get purge -y --auto-remove $buildDeps

COPY john.ini /root/john.ini
COPY passwd.lst /root/passwd.lst

WORKDIR /root

ENTRYPOINT [ "john" ]
