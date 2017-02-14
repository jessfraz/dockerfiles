# keepassxc
#
# docker run -d \
#		-v /tmp/.X11-unix:/tmp/.X11-unix \
#		-v /etc/machine-id:/etc/machine-id:ro \
#		-v /usr/share/X11/xkb:/usr/share/X11/xkb/:ro
#		-e DISPLAY=unix$DISPLAY \
#		keepassxc
#
FROM alpine:latest
MAINTAINER Christian Koep <christian.koep@fom-net.de>

ENV KEEPASSXC_VERSION 2.1.1

RUN buildDeps=' \
                automake \
                bash \
                cmake \
                g++ \
                gcc \
                git \
                libgcrypt-dev \
                libmicrohttpd-dev \
                make \
                qt5-qtbase-dev \
                qt5-qttools-dev \
	' \
	set -x \
	&& apk --no-cache add --repository https://dl-3.alpinelinux.org/alpine/edge/community $buildDeps \
	&& git clone --depth 1 --branch ${KEEPASSXC_VERSION} https://github.com/keepassxreboot/keepassxc.git /usr/src/keepassxc \
	&& cd /usr/src/keepassxc \
	&& mkdir build \
	&& cd build \
	&& cmake -DWITH_TESTS=ON -DWITH_XC_AUTOTYPE=ON -DWITH_XC_HTTP=ON .. \
	&& make \
	&& make install \
	&& apk del $buildDeps \
	&& rm -rf /usr/src/keepassxc \
	&& echo "Build complete."

RUN	apk --no-cache add --repository https://dl-3.alpinelinux.org/alpine/edge/community \
		libmicrohttpd \
		libgcrypt \
		mesa-dri-intel \
		qt5-qtbase \
		qt5-qtbase-x11 \
		qt5-qttools \
		ttf-ubuntu-font-family

ENTRYPOINT [ "/usr/local/bin/keepassxc" ]
