FROM debian:jessie

RUN	apt-get update && apt-get install -y \
  build-essential \
	cmake \
	libtag1c2a \
	libtag1-dev \
	libqt4-dev \
	libqt4-sql-sqlite \
	libphonon-dev \
	libboost-dev \
	libboost-thread-dev \
	zlib1g-dev \
	libgnutls-dev \
	libz-dev \
	libqjson-dev \
	libqca2-dev \
	libx11-dev \
	pkg-config \
	libqca2-plugin-ossl \
	libidn2-0-dev \
	speex \
	libsamplerate0-dev \
	libfftw3-dev \
	libgsasl7-dev \
	--no-install-recommends

ADD	ftp://ftp.kde.org/pub/kde/stable/attica/attica-0.4.1.tar.bz2 /root/attica

RUN	mkdir /root/attica/build && cd /root/attica/build && \
	cmake .. && \
	make && make install

ADD	https://github.com/tomahawk-player/tomahawk.git /root/tomahawk

RUN	mkdir /root/tomahawk/build && cd /root/tomahawk/build && \
	cmake .. && \
	make && \
	mv /root/tomahawk/tomahawk /usr/bin/

ENTRYPOINT [ "/usr/bin/tomahawk" ]
