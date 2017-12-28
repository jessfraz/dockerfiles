FROM alpine:latest

LABEL maintainer "Christian Koep <christiankoep@gmail.com>"

RUN apk add --no-cache \
	alsa-lib \
	ca-certificates \
	firefox-esr \
	hicolor-icon-theme \
	mesa-dri-intel \
	mesa-gl \
	ttf-dejavu

ENTRYPOINT ["/usr/bin/firefox"]
