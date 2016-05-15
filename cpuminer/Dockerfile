FROM debian:sid
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	ca-certificates \
	libcurl3 \
	openssl \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN buildDeps=' \
		automake \
		gcc \
		git \
		libcurl3-openssl-dev \
		libssl-dev \
		make \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& git clone --depth 1 https://github.com/pooler/cpuminer.git /usr/src/cpuminer \
	&& ( \
	cd /usr/src/cpuminer \
	&& ./autogen.sh \
	&& ./configure CFLAGS="-O3" \
	&& make \
	&& make install \
	) \
	&& rm -rf /usr/src/cpuminer \
	&& apt-get purge -y --auto-remove $buildDeps

ENTRYPOINT [ "minerd" ]
