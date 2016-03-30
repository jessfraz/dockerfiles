# Run ricochet in a container
# see: https://ricochet.im/
#
# docker run -d \
#	--restart always \
#	-v /etc/localtime:/etc/localtime:ro \
#	-v /tmp/.X11-unix:/tmp/.X11-unix \
#	-e DISPLAY=unix$DISPLAY \
# 	--name ricochet \
# 	jess/ricochet
#
FROM debian:sid
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	libasound2 \
	libfontconfig1 \
	libgl1-mesa-dri \
	libgl1-mesa-glx \
	libx11-xcb1 \
	libxext6 \
	libxrender1 \
	qtbase5-dev \
	&& rm -rf /var/lib/apt/lists/*

ENV RICOCHET_VERSION 1.1.2
ENV RICOCHET_FINGERPRINT 0xFF97C53F183C045D

RUN buildDeps=' \
		bzip2 \
		ca-certificates \
		curl \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& curl -sSL https://ricochet.im/releases/latest/ricochet-${RICOCHET_VERSION}-static-x86_64.tar.bz2 -o /tmp/ricochet.tar.bz2 \
	&& curl -sSL https://ricochet.im/releases/latest/ricochet-${RICOCHET_VERSION}-static-x86_64.tar.bz2.asc -o /tmp/ricochet.tar.bz2.asc \
	&& mkdir ~/.gnupg \
	&& gpg --keyserver pgp.mit.edu --recv-keys ${RICOCHET_FINGERPRINT} \
	&& gpg --fingerprint ${RICOCHET_FINGERPRINT} | grep "Key fingerprint = 9032 CAE4 CBFA 933A 5A21  45D5 FF97 C53F 183C 045D" \
	&& gpg /tmp/ricochet.tar.bz2.asc \
	&& tar -vxj --strip-components 1 -C /usr/local/bin -f /tmp/ricochet.tar.bz2 \
	&& rm -rf /tmp/ricochet* \
	&& rm -rf ~/.gnupg \
	&& apt-get purge -y --auto-remove $buildDeps

ENTRYPOINT [ "ricochet" ]
