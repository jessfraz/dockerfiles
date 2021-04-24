# NES emulator in a container
#
# docker run --rm -d \
# 	--device /dev/snd \
# 	-v /tmp/.X11-unix:/tmp/.X11-unix \
# 	-e DISPLAY=unix$DISPLAY \
# 	--device /dev/dri \
# 	jess/nes /games/zelda.rom
#
FROM debian:sid-slim
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apt-get update && apt-get install -y \
	binutils \
	ca-certificates \
	gcc \
	git \
	golang \
	libgl1-mesa-dev \
	libgl1-mesa-dri \
	libxcursor-dev \
	libxxf86vm-dev \
	libxi-dev \
	libxinerama-dev \
	libxrandr-dev \
	mercurial \
	portaudio19-dev \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& ldconfig

ENV GOPATH /go
ENV PATH /go/bin:$PATH

RUN go get github.com/fogleman/nes

COPY games /games

ENTRYPOINT [ "nes" ]
