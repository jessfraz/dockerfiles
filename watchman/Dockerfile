FROM debian:sid
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	ca-certificates \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV WATCHMAN_VERSION v4.7.0

RUN buildDeps=' \
		autoconf \
		automake \
		clang \
		git \
		make \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& git clone --depth 1 --branch "${WATCHMAN_VERSION}" https://github.com/facebook/watchman.git /usr/src/watchman \
	&& cd /usr/src/watchman \
	&& ./autogen.sh \
	&& ./configure \
	&& make \
	&& make install \
	&& rm -rf /usr/src/watchman \
	&& apt-get purge -y --auto-remove $buildDeps

ENTRYPOINT [ "watchman" ]
