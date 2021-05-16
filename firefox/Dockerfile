#Run firefox in a container:
#
#docker run -d --rm --net host \
#	--device /dev/snd --device /dev/dri -v /dev/shm:/dev/shm \
#	-v /tmp/.X11-unix:/tmp/.X11-unix -e DISPLAY=unix$DISPLAY \
#	-v $HOME/Downloads:/home/user/Downloads \
#	-v $HOME/.mozilla:/home/user/.mozilla \
#	--name firefox jess/firefox
#

ARG DEBVERSION=bullseye-slim
FROM debian:$DEBVERSION
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

ARG UBUVERSION=bionic
RUN apt-get update && apt-get install -y \
	dirmngr \
	gnupg \
	--no-install-recommends \
	&& apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 0AB215679C571D1C8325275B9BDB3D89CE49EC21 \
	&& echo "deb http://ppa.launchpad.net/mozillateam/firefox-next/ubuntu ${UBUVERSION} main" >> /etc/apt/sources.list.d/firefox.list \
	&& apt-get update && apt-get install -y \
	apulse \
	ca-certificates \
	ffmpeg \
	firefox \
	hicolor-icon-theme \
	libasound2 \
	libgl1-mesa-dri \
	libgl1-mesa-glx \
	libpulse0 \
	fonts-noto \
	fonts-noto-cjk \
	fonts-noto-color-emoji \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV LANG C.UTF-8

COPY local.conf /etc/fonts/local.conf

RUN echo 'pref("browser.tabs.remote.autostart", false);' >> /etc/firefox/syspref.js

COPY entrypoint.sh /usr/bin/startfirefox

ARG USER=user
ARG HOME=/home/${USER}
RUN useradd --create-home --home-dir $HOME $USER && chown -R ${USER}:${USER} $HOME
WORKDIR $HOME
USER $USER

ENTRYPOINT [ "startfirefox" ]
