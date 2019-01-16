# Run slack desktop app in a container
#
# docker run --rm -it \
#	-v /etc/localtime:/etc/localtime:ro \
#	-v /tmp/.X11-unix:/tmp/.X11-unix \
#	-e DISPLAY=unix$DISPLAY \
#	--device /dev/snd \
#	--device /dev/dri \
#	--device /dev/video0 \
#	--group-add audio \
#	--group-add video \
#	-v "${HOME}/.slack:/root/.config/Slack" \
#	--ipc="host" \
#	--name slack \
#	westonsteimel/slack "$@"

FROM westonsteimel/debian:sid-slim

ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8
ENV SLACK_VERSION 3.3.7

RUN apt-get update \
    && apt-get install -y \
	ca-certificates \
	curl \
	locales \
	--no-install-recommends \
    && echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen \
	&& locale-gen en_US.utf8 \
	&& /usr/sbin/update-locale LANG=en_US.UTF-8 \
    && curl -fSL "https://downloads.slack-edge.com/linux_releases/slack-desktop-${SLACK_VERSION}-amd64.deb" -o /tmp/slack-desktop.deb \
    && apt-get update && apt-get -y install \
	libasound2 \
	libgtk-3-0 \
	libx11-xcb1 \
	libxkbfile1 \
	/tmp/slack-desktop.deb \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
    && rm /tmp/slack-desktop.deb

ENTRYPOINT ["/usr/lib/slack/slack"]
