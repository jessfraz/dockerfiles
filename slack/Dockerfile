# Run slack desktop app in a container
#
# docker run --rm -it \
#	-v /etc/localtime:/etc/localtime:ro \
#	-v /tmp/.X11-unix:/tmp/.X11-unix \
#	-e DISPLAY=unix$DISPLAY \
#	--device /dev/snd:/dev/snd \
#	--name slack \
#	jess/slack

FROM debian:sid
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	apt-transport-https \
	ca-certificates \
	curl \
	gconf2 \
	gconf-service \
	gvfs-bin \
	hunspell-en-us \
	libasound2 \
	libgtk2.0-0 \
	libnotify4 \
	libnss3 \
	libxss1 \
	libxtst6 \
	locales \
	python-minimal \
	xdg-utils \
	--no-install-recommends \
	&& echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen \
	&& locale-gen en_US.utf8 \
	&& /usr/sbin/update-locale LANG=en_US.UTF-8 \
	&& curl -sSL https://slack-ssb-updates.global.ssl.fastly.net/linux_releases/slack-desktop-1.2.2-amd64.deb > /tmp/slack-desktop.deb \
	&& dpkg -i /tmp/slack-desktop.deb \
	&& rm -rf /var/lib/apt/lists/* \
	&& rm -rf /tmp/slack-desktop.deb

ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8

ENTRYPOINT ["slack"]
