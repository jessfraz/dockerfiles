# VLC media player
#
# docker run -d \
#	-v /etc/localtime:/etc/localtime:ro \
#	--device /dev/snd \
#	--device /dev/dri \
#	-v /tmp/.X11-unix:/tmp/.X11-unix \
#	-e DISPLAY=unix$DISPLAY \
#	--name vlc \
#	jess/vlc
#
FROM debian:sid
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	libgl1-mesa-dri \
	libgl1-mesa-glx \
	vlc \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV HOME /home/vlc
ENV DISPLAY :0
ENV XDG_RUNTIME_DIR /run/user/1000

RUN useradd --create-home --home-dir $HOME vlc \
	&& chown -R vlc:vlc $HOME \
	&& usermod -a -G audio,video vlc

WORKDIR $HOME
USER vlc

ENTRYPOINT [ "vlc" ]
