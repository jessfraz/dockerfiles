FROM debian:sid
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	ca-certificates \
	libcurl3 \
	libxml2 \
	openssl \
	pinentry-curses \
	xclip \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN buildDeps=' \
		gcc \
		git \
		libcurl4-openssl-dev \
		libssl-dev \
		libxml2-dev \
		make \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& git clone --depth 1 https://github.com/LastPass/lastpass-cli.git /usr/src/lastpass-cli \
	&& cd /usr/src/lastpass-cli \
	&& make \
	&& make install \
	&& rm -rf /usr/src/lastpass-cli \
	&& apt-get purge -y --auto-remove $buildDeps

ENTRYPOINT [ "lpass" ]
