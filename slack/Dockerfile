# To use:
# Needs X11 socket and dbus mounted
# 
# docker run --rm -it \
#	-v /etc/machine-id:/etc/machine-id:ro \
#	-v /etc/localtime:/etc/localtime:ro \
#	-v /tmp/.X11-unix:/tmp/.X11-unix \
#	-e DISPLAY=unix$DISPLAY \
#	--device /dev/snd:/dev/snd \
#	-v /var/run/dbus:/var/run/dbus \
#	--name slack \
#	jess/slack

FROM ubuntu:14.04
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	dbus-x11 \
	dunst \
	hunspell-en-us \
	python3-dbus \
	software-properties-common \
	--no-install-recommends && \
	apt-add-repository -y ppa:rael-gc/scudcloud && \
	apt-get update && \
	apt-get install -y \
	scudcloud \
	&& rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["/usr/bin/scudcloud"]
