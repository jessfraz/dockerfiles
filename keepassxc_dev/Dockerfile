# keepassxc_dev
#
# To run the keepassxc baked in the image on macos by using 2 ttys:
# 	1. socat TCP-LISTEN:6000,reuseaddr,fork UNIX-CLIENT:\"$DISPLAY\"
# 	(source: https://github.com/moby/moby/issues/8710)
#	2. In another tty:
#       $ docker run -it --rm -e DISPLAY=192.168.1.110:0 \
#       						-v $HOME/Documents:/home/me/Documents \
#       						-v $HOME/.config/keepassxc:/home/me/.config/keepassxc \
#       						keepassxc_dev
FROM alpine:latest

ENV KEEPASSXC_VERSION 2.5.3
ENV HOMEDIR home
ENV USER me

RUN apk --no-cache add automake
RUN apk --no-cache add argon2-libs
RUN apk --no-cache add argon2-dev
RUN apk --no-cache add bash
RUN apk --no-cache add sudo
RUN apk --no-cache add cmake
RUN apk --no-cache add curl-dev
RUN apk --no-cache add expat
RUN apk --no-cache add g++
RUN apk --no-cache add gdb
RUN apk --no-cache add gcc
RUN apk --no-cache add make
RUN apk --no-cache add git
RUN apk --no-cache add ttf-dejavu
RUN apk --no-cache add libcurl
RUN apk --no-cache add libgcrypt
RUN apk --no-cache add libgcrypt-dev
RUN apk --no-cache add libmicrohttpd
RUN apk --no-cache add libmicrohttpd-dev
RUN apk --no-cache add qt5-qtbase
RUN apk --no-cache add qt5-qtbase-dev
RUN apk --no-cache add qt5-qtbase-x11
RUN apk --no-cache add qt5-qttools
RUN apk --no-cache add qt5-qttools-dev
RUN apk --no-cache add libsodium-dev
RUN apk --no-cache add libqrencode-dev
RUN apk --no-cache add qt5-qtsvg-dev
RUN apk --no-cache add mesa-dri-intel

RUN adduser --disabled-password \
            --gecos "" \
            -h /${HOMEDIR}/${USER} ${USER}
USER ${USER}
RUN git clone --depth 1 --branch ${KEEPASSXC_VERSION} \
									https://github.com/tsanov/keepassxc.git \
									/${HOMEDIR}/${USER}/keepassxc
WORKDIR /${HOMEDIR}/${USER}/keepassxc
RUN mkdir build
WORKDIR build
RUN cmake -DWITH_TESTS=ON -DWITH_XC_AUTOTYPE=ON -DWITH_XC_HTTP=ON ..
RUN make
WORKDIR /${HOMEDIR}/${USER}/keepassxc/src
RUN ln -s /${HOMEDIR}/${USER}/keepassxc/build/src/keepassxc
RUN echo "Build complete."

ENTRYPOINT [ "bash" ]
