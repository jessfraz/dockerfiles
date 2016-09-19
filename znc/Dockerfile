# Run znc in a container
#
# docker run --restart always -d \
#	--name znc \
#	-p 6697:6697 \
#	-v /volumes/znc:/home/user/.znc \
#	jess/znc
#
FROM debian:stretch
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	ca-certificates \
	curl \
	libdatetime-perl \
	libglib2.0-0 \
	libwww-perl \
	perl \
	&& rm -rf /var/lib/apt/lists/*

ENV HOME /home/user
RUN useradd --create-home --home-dir $HOME user \
	&& chown -R user:user $HOME

ENV LANG C.UTF-8

ENV ZNC_VERSION 1.6.3

RUN buildDeps=' \
		build-essential \
		libssl-dev \
		libperl-dev \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& curl -sSL "http://znc.in/releases/znc-${ZNC_VERSION}.tar.gz" -o /tmp/znc.tar.gz \
	&& mkdir -p /usr/src/znc \
	&& tar -xzf /tmp/znc.tar.gz -C /usr/src/znc --strip-components 1 \
	&& rm /tmp/znc.tar.gz* \
	&& cd /usr/src/znc \
	&& ./configure \
	&& make -j8 \
	&& make install \
	&& rm -rf /usr/src/znc \
	&& apt-get purge -y --auto-remove $buildDeps

WORKDIR $HOME
USER user

ENTRYPOINT [ "znc" ]
CMD [ "-f" ]
