# keepassxc
#
# docker run -d \
#       -v /tmp/.X11-unix:/tmp/.X11-unix \
#       -v /etc/machine-id:/etc/machine-id:ro \
#       -v /usr/share/X11/xkb:/usr/share/X11/xkb/:ro \
#       -v $HOME/.config/keepassxc:/root/.config/keepassxc \
#       -e DISPLAY=unix$DISPLAY \
#       jess/keepassxc
#
FROM alpine:latest
LABEL maintainer "Christian Koep <christiankoep@gmail.com>"

ENV KEEPASSXC_VERSION 2.5.3

#### RUN buildDeps=' \
####        automake \
####        argon2-dev \
####        bash \
####        cmake \
####        curl-dev \
####        expat \
####        g++ \
####        gcc \
####        git \
####        libgcrypt-dev \
####        libmicrohttpd-dev \
####        make \
####        qt5-qtbase-dev \
####        qt5-qttools-dev \
####    ' \
####    set -x \
####    && apk --no-cache add \
####        $buildDeps \
RUN apk --no-cache add automake
RUN apk --no-cache add argon2-dev
RUN apk --no-cache add bash
RUN apk --no-cache add cmake
RUN apk --no-cache add curl-dev
RUN apk --no-cache add expat
RUN apk --no-cache add g++
RUN apk --no-cache add gcc
RUN apk --no-cache add git
RUN apk --no-cache add libgcrypt-dev
RUN apk --no-cache add libmicrohttpd-dev
RUN apk --no-cache add make
RUN apk --no-cache add qt5-qtbase-dev
RUN apk --no-cache add qt5-qttools-dev
RUN apk --no-cache add libsodium-dev
RUN apk --no-cache add libqrencode-dev
RUN apk --no-cache add qt5-qtsvg-dev
#sudo apt-get install git build-essential cmake qt5-default qtscript5-dev libssl-dev qttools5-dev qttools5-dev-tools qtmultimedia5-dev libqt5svg5-dev libqt5webkit5-dev libsdl2-dev libasound2 libxmu-dev libxi-dev freeglut3-dev libasound2-dev libjack-jackd2-dev libxrandr-dev libqt5xmlpatterns5-dev libqt5xmlpatterns5 libqt5xmlpatterns5-private-dev
RUN git clone --depth 1 --branch ${KEEPASSXC_VERSION} https://github.com/keepassxreboot/keepassxc.git /usr/src/keepassxc
WORKDIR /usr/src/keepassxc
RUN mkdir build
WORKDIR build
RUN cmake -DWITH_TESTS=ON -DWITH_XC_AUTOTYPE=ON -DWITH_XC_HTTP=ON ..
RUN make
RUN make install
# RUN apk del $buildDeps
RUN rm -rf /usr/src/keepassxc
RUN echo "Build complete."

RUN apk --no-cache add \
        argon2-libs \
        libcurl \
        libmicrohttpd \
        libgcrypt \
        mesa-dri-intel \
        qt5-qtbase \
        qt5-qtbase-x11 \
        qt5-qttools \
        ttf-dejavu

RUN mkdir /Users
RUN adduser --disabled-password \
            --gecos "" \
            -h /Users/nikolaytsanov nikolaytsanov

USER nikolaytsanov

ENTRYPOINT [ "/usr/local/bin/keepassxc" ]
