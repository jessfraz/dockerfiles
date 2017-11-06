# Usage:
#	docker run  -d \
#		--name=opensnitchd \
#		--net host \
#		r.j3ss.co/opensnitchd
#
FROM alpine:latest

RUN apk add --no-cache \
	python3

ENV OPENSNITCH_VERSION master
ENV PYINSTALLER_TAG v3.3

COPY ldd /bin/ldd
COPY hook-opensnitch.py /tmp/hooks/hook-opensnitch.py
ENV PATH /bin:$PATH

RUN buildDeps=' \
				build-base \
                git \
			libc-dev \
				libcap-dev \
				libnetfilter_queue-dev \
				libnfnetlink-dev \
				musl-dev \
				python3-dev \
				py3-gobject3 \
				py3-inotify \
				py3-qt5 \
				zlib-dev \
	' \
	set -x \
	&& apk --no-cache add $buildDeps \
		--repository https://dl-3.alpinelinux.org/alpine/edge/testing \
	&& git clone --depth 1 --branch $PYINSTALLER_TAG https://github.com/pyinstaller/pyinstaller.git /tmp/pyinstaller \
	&& ( \
	cd /tmp/pyinstaller/bootloader \
	&& python3 ./waf configure --no-lsb all \
	&& pip3 install .. \
	&& rm -Rf /tmp/pyinstaller \
	) \
	&& git clone --depth 1 --branch ${OPENSNITCH_VERSION} https://github.com/evilsocket/opensnitch.git /usr/src/opensnitch \
	&& (  \
		cd /usr/src/opensnitch \
		&& python3 setup.py install \
		&& pyinstaller \
			--exclude-module pycrypto \
			--exclude-module PyInstaller \
			--noconfirm \
			--onefile \
			--clean \
			--hidden-import=pkg_resources \
			--additional-hooks-dir=/tmp/hooks/ \
			$(which opensnitchd) \
		&& mv dist/opensnitchd $(which opensnitchd) \
		&& pyinstaller \
			--exclude-module pycrypto \
			--exclude-module PyInstaller \
			--noconfirm \
			--onefile \
			--clean \
			$(which opensnitch-qt) \
		&& mv dist/opensnitch-qt $(which opensnitch-qt) \
		&& rm -rf /usr/src/opensnitch \
	) \
	&& apk del $buildDeps \
	&& echo "Build complete."

CMD ["/usr/bin/opensnitchd"]
