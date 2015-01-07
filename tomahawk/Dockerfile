FROM debian:wheezy

RUN apt-get update && apt-get install -y \
    build-essential \
    ca-certificates \
    cmake \
    curl \
    libtag1c2a \
    libtag1-dev \
    libqt4-dev \
    libqt4-sql-sqlite \
    libphonon-dev \
    phonon-dbg \
    libphononexperimental4 \
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
    automoc \
    pulseaudio \
    alsa-utils \
    --no-install-recommends

RUN curl -sSL http://download.kde.org/stable/attica/attica-0.4.1.tar.bz2 | tar -v -C /root -xj && \
    mv /root/attica-0.4.1 /root/attica && \
    mkdir -p /root/attica/build && cd /root/attica/build && \
    cmake .. && \
    make && make install

RUN curl -sSL https://github.com/tomahawk-player/tomahawk/archive/0.8.2.tar.gz | tar -v -C /root -xz && \
    mv /root/tomahawk-0.8.2 /root/tomahawk/ && \
    mkdir -p /root/tomahawk/build && cd /root/tomahawk/build && \
    cmake .. && \
    make && \
    mv /root/tomahawk/tomahawk /usr/bin/

ENTRYPOINT  [ "/usr/bin/tomahawk" ]
