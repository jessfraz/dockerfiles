# Usage:
#
# docker build --rm --force-rm -t jess/yubikey .
#
# docker run --rm -it --device /dev/usb \
# 	--device /dev/bus/usb \
# 	jess/yubikey
#
FROM debian:sid
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	ca-certificates \
	curl \
	opensc \
	opensc-pkcs11 \
	openssl \
	usbutils \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV CCID_VERSION 1.4.20
ENV PCSC_LITE_VERSION 1.8.14
ENV YUBIKEY_PIV_TOOL_VERSION 1.1.0
RUN buildDeps=' \
		autoconf \
		bzip2 \
		clang \
		file \
		libssl-dev \
		libusb-1.0-0-dev \
		make \
		pkg-config \
	' \
	&& set -x \
	&& gpg --keyserver pgp.mit.edu --recv-key E8F9C57E \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& curl -sSL "https://alioth.debian.org/frs/download.php/file/4138/pcsc-lite-${PCSC_LITE_VERSION}.tar.bz2" -o /tmp/pcsc-lite.tar.bz2 \
	&& curl -sSL "https://alioth.debian.org/frs/download.php/file/4139/pcsc-lite-${PCSC_LITE_VERSION}.tar.bz2.asc" -o /tmp/pcsc-lite.tar.bz2.asc \
	&& gpg --verify /tmp/pcsc-lite.tar.bz2.asc \
	&& mkdir -p /usr/src/pcsc-lite \
	&& tar -xjf /tmp/pcsc-lite.tar.bz2 -C /usr/src/pcsc-lite --strip-components 1 \
	&& rm /tmp/pcsc-lite.tar.bz2* \
	&& cd /usr/src/pcsc-lite \
	&& ./configure --prefix="/usr" \
		--enable-libusb \
		--disable-libudev \
	&& make \
	&& make install \
	&& cd /usr/src && rm -rf /usr/src/pcsc-lite* \
	&& curl -sSL "https://alioth.debian.org/frs/download.php/file/4140/ccid-${CCID_VERSION}.tar.bz2" -o /tmp/ccid.tar.bz2 \
	&& curl -sSL "https://alioth.debian.org/frs/download.php/file/4141/ccid-${CCID_VERSION}.tar.bz2.asc" -o /tmp/ccid.tar.bz2.asc \
	&& gpg --verify /tmp/ccid.tar.bz2.asc \
	&& mkdir -p /usr/src/ccid \
	&& ls /tmp/ \
	&& tar -xjf /tmp/ccid.tar.bz2 -C /usr/src/ccid --strip-components 1 \
	&& rm /tmp/ccid.tar.bz2* \
	&& cd /usr/src/ccid \
	&& ./configure --prefix="/usr" \
	&& make \
	&& make install \
	&& cp src/92_pcscd_ccid.rules /etc/udev/rules.d/ \
	&& cd /usr/src && rm -rf /usr/src/ccid* \
	&& mkdir -p /usr/src/yubico-piv-tool \
	&& curl -sSL "https://s3.j3ss.co/tmp/yubico-piv-tool-${YUBIKEY_PIV_TOOL_VERSION}.tar.gz" | tar -xz -C /usr/src/yubico-piv-tool --strip-components 1 \
	&& cd /usr/src/yubico-piv-tool \
	&& ./configure --prefix="/usr" \
	&& make \
	&& make install \
	&& cd ~ && rm -rf /usr/src/yubico-piv-tool* \
	&& apt-get purge -y --auto-remove $buildDeps

COPY testsign.sh /usr/local/bin/testsign.sh

CMD ["/usr/local/bin/testsign.sh"]
