# Run ykpersonalize in a container
#
# docker run --rm -it \
# 	--device /dev/bus/usb \
# 	--device /dev/usb
#	--name ykpersonalize \
#	jess/ykpersonalize
#
FROM debian:sid
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	ca-certificates \
	curl \
	libjson0 \
	libusb-1.0-0 \
	libyubikey0 \
	pcscd \
	usbutils \
	yubico-piv-tool \
	&& rm -rf /var/lib/apt/lists/*

ENV YKPERS_VERSION 1.6.1

RUN buildDeps=' \
		build-essential \
		libjson0-dev \
		libusb-1.0-0-dev \
		libyubikey-dev \
		pkg-config \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& curl -sSL "https://yubico.github.io/yubikey-personalization/releases/ykpers-${YKPERS_VERSION}.tar.gz" -o /tmp/ykpersonalize.tar.gz \
	&& mkdir -p /usr/src/ykpersonalize \
	&& tar -xzf /tmp/ykpersonalize.tar.gz -C /usr/src/ykpersonalize --strip-components 1 \
	&& cd /usr/src/ykpersonalize \
	&& ./configure \
	&& make check install \
	&& rm -rf /tmp/ykpersonalize* \
	&& rm -rf /usr/src/ykpersonalize \
	&& apt-get purge -y --auto-remove $buildDeps

WORKDIR /root/

COPY entrypoint.sh /usr/local/bin/

ENTRYPOINT [ "/usr/local/bin/entrypoint.sh" ]
CMD [ "ykpersonalize", "--help" ]
