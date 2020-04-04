# keepassxc_dev
#
# To run the keepassxc baked in the image:
# docker run -d \
#       -v /tmp/.X11-unix:/tmp/.X11-unix \
#       -v /etc/machine-id:/etc/machine-id:ro \
#       -v /usr/share/X11/xkb:/usr/share/X11/xkb/:ro \
#       -v $HOME/.config/keepassxc:/home/me/.config/keepassxc \
#       -e DISPLAY=unix$DISPLAY \
#       keepassxc_dev \
#       /usr/local/bin/keepassxc
#
FROM alpine:latest

ENV KEEPASSXC_VERSION 2.5.3
ENV HOMEDIR home
ENV USER me

RUN apk --no-cache add automake
RUN apk --no-cache add argon2-dev
RUN apk --no-cache add bash
RUN apk --no-cache add cmake
RUN apk --no-cache add curl-dev
RUN apk --no-cache add expat
RUN apk --no-cache add g++
RUN apk --no-cache add gdb
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
RUN git clone --depth 1 --branch ${KEEPASSXC_VERSION} https://github.com/keepassxreboot/keepassxc.git /usr/src/keepassxc
WORKDIR /usr/src/keepassxc
RUN mkdir build
WORKDIR build
RUN cmake -DWITH_TESTS=ON -DWITH_XC_AUTOTYPE=ON -DWITH_XC_HTTP=ON ..
RUN make
RUN make install
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

RUN mkdir /${HOMEDIR}
RUN adduser --disabled-password \
            --gecos "" \
            -h /${HOMEDIR}/${USER} ${USER}

USER ${USER}

ENTRYPOINT [ "/usr/bin/bash" ]
