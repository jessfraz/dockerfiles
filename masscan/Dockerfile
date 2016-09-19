FROM debian:sid
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	ca-certificates \
	libpcap-dev \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN buildDeps=' \
		gcc \
		git \
		make \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& git clone https://github.com/robertdavidgraham/masscan.git /usr/src/masscan \
	&& cd /usr/src/masscan \
	&& make \
	&& make install \
	&& rm -rf /usr/src/masscan \
	&& apt-get purge -y --auto-remove $buildDeps

ENTRYPOINT [ "masscan" ]
