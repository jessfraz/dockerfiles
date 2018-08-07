FROM alpine:latest

LABEL maintainer "Christian Koep <christiankoep@gmail.com>"

RUN echo "@testing http://nl.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
    && apk add --no-cache \
    dbus-x11 \
    alsa-lib \
	ca-certificates \
	firefox@testing \
	hicolor-icon-theme \
	mesa-dri-intel \
	mesa-gl \
	ttf-dejavu

ENTRYPOINT ["/usr/bin/firefox"]
