FROM debian:stretch
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	ca-certificates \
	libcrypt-ssleay-perl \
	libio-socket-ssl-perl \
	libpcap0.8 \
	libwww-perl \
	perl \
	zlib1g \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV DAQ_VERSION 2.0.6
ENV LIBDNET_VERSION 1.12
ENV SNORT_VERSION 2.9.9.0
ENV PULLEDPORK_VERSION 0.7.2

RUN buildDeps=' \
		curl \
		bison \
		build-essential \
		file \
		flex \
		libpcap-dev \
		libpcre3-dev \
		zlib1g-dev \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& curl -sSL "https://www.snort.org/downloads/snort/daq-${DAQ_VERSION}.tar.gz" -o /tmp/daq.tar.gz \
	&& mkdir -p /usr/src/daq \
	&& tar -xzf /tmp/daq.tar.gz -C /usr/src/daq --strip-components=1 \
	&& rm /tmp/daq.tar.gz \
	&& ( \
		cd /usr/src/daq \
		&& ./configure \
		&& make \
		&& make install \
	) \
	&& curl -sSL "https://github.com/dugsong/libdnet/archive/libdnet-${LIBDNET_VERSION}.tar.gz" -o /tmp/libdnet.tar.gz \
	&& mkdir -p /usr/src/libdnet \
	&& tar -xzf /tmp/libdnet.tar.gz -C /usr/src/libdnet --strip-components=1 \
	&& rm /tmp/libdnet.tar.gz \
	&& ( \
		cd /usr/src/libdnet \
		&& ./configure \
			--prefix=/usr \
		&& make \
		&& make install \
	) \
	&& curl -sSL "https://www.snort.org/downloads/snort/snort-${SNORT_VERSION}.tar.gz" -o /tmp/snort.tar.gz \
	&& mkdir -p /usr/src/snort \
	&& tar -xzf /tmp/snort.tar.gz -C /usr/src/snort --strip-components=1 \
	&& rm /tmp/snort.tar.gz \
	&& ( \
		cd /usr/src/snort \
		&& ./configure \
			--enable-sourcefire \
		&& make \
		&& make install \
	) \
	&& curl -sSL "https://github.com/shirkdog/pulledpork/archive/${PULLEDPORK_VERSION}.tar.gz" -o /tmp/pulledpork.tar.gz \
	&& mkdir -p /usr/src/pulledpork \
	&& tar -xzf /tmp/pulledpork.tar.gz -C /usr/src/pulledpork --strip-components=1 \
	&& rm /tmp/pulledpork.tar.gz \
	&& apt-get purge -y --auto-remove $buildDeps

COPY init.sh /usr/local/bin/init.sh
COPY update-rules.sh /usr/local/bin/update-rules.sh

ENTRYPOINT ["/usr/local/bin/init.sh"]
CMD ["snort"]
