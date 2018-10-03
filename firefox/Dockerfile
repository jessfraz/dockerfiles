# firefox
#
#    docker run -it \
#        --rm \
#        --memory 2gb \
#        --net host \
#        --cpuset-cpus 0 \
#        -v /etc/localtime:/etc/localtime:ro \
#        -v /tmp/.X11-unix:/tmp/.X11-unix \
#        -v "${HOME}/.firefox/cache:/home/firefox/.cache/mozilla" \
#        -v "${HOME}/.firefox/mozilla:/home/firefox/.mozilla" \
#        -v "${HOME}/Downloads:/home/firefox/Downloads" \
#        -v "${HOME}/Pictures:/home/firefox/Pictures" \
#        -v "${HOME}/Torrents:/home/firefox/Torrents" \
#        -e "DISPLAY=unix${DISPLAY}" \
#        -e GDK_SCALE \
#        -e GDK_DPI_SCALE \
#        -v /dev/shm:/dev/shm \
#        --device /dev/snd \
#        --device /dev/dri \
#        --name firefox \
#        jess/firefox "$@"

FROM debian:sid-slim
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apt-get update && apt-get install -y \
	dirmngr \
	gnupg \
	--no-install-recommends \
	&& apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 0AB215679C571D1C8325275B9BDB3D89CE49EC21 \
	&& echo "deb http://ppa.launchpad.net/mozillateam/firefox-next/ubuntu xenial main" >> /etc/apt/sources.list.d/firefox.list \
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

ENV LANG en-US

RUN groupadd -r firefox && useradd -m -g firefox -G audio,video firefox \
    && chown -R firefox:firefox /home/firefox

COPY local.conf /etc/fonts/local.conf

RUN echo 'pref("browser.tabs.remote.autostart", false);' >> /etc/firefox/syspref.js

COPY entrypoint.sh /usr/bin/startfirefox

USER firefox

ENTRYPOINT [ "startfirefox" ]
