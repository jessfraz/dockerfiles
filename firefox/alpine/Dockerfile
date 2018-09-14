FROM alpine:latest

LABEL maintainer "Christian Koep <christiankoep@gmail.com>"

RUN echo "@testing http://nl.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
    && apk add --no-cache \
    alsa-lib \
	dbus-x11 \
    ca-certificates \
	firefox@testing \
	hicolor-icon-theme \
	mesa-dri-intel \
	mesa-gl \
	ttf-dejavu

# Add firefox user
RUN addgroup firefox \
    && adduser -G firefox -s /bin/sh -D firefox \
    && chown -R firefox:firefox /home/firefox \
    && addgroup firefox audio \
    && addgroup firefox video

# Run Firefox as non privileged user
USER firefox

ENTRYPOINT ["/usr/bin/firefox"]
