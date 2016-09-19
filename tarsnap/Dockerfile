FROM debian:sid
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	ca-certificates \
	gnupg \
	&& rm -rf /var/lib/apt/lists/*

ENV TARSNAP_VERSION 1.0.37

RUN buildDeps=' \
		curl \
		e2fslibs-dev \
		gcc \
		libc6-dev \
		libdigest-sha-perl \
		libssl-dev \
		make \
		zlib1g-dev \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& curl -sSL "https://www.tarsnap.com/download/tarsnap-autoconf-${TARSNAP_VERSION}.tgz" -o /tmp/tarsnap.tgz \
	&& curl -sSL "https://www.tarsnap.com/download/tarsnap-sigs-${TARSNAP_VERSION}.asc" -o /tmp/tarsnap.tgz.asc \
	&& curl -sSL "https://www.tarsnap.com/tarsnap-signing-key-2015.asc" | gpg --import \
	&& sha=$(gpg --decrypt /tmp/tarsnap.tgz.asc | awk '{ print $4 }') \
	&& if [ "$sha" != "$(shasum -a 256 /tmp/tarsnap.tgz | awk '{ print $1 }')" ]; then exit 1; fi \
	&& mkdir -p /usr/src/tarsnap \
	&& tar -xzf /tmp/tarsnap.tgz -C /usr/src/tarsnap --strip-components 1 \
	&& rm /tmp/tarsnap.tgz* \
	&& cd /usr/src/tarsnap \
	&& ./configure --prefix=/usr \
	&& make \
	&& make install \
	&& rm -rf /usr/src/tarsnap \
	&& apt-get purge -y --auto-remove $buildDeps

CMD [ "tarsnap", "--help" ]
