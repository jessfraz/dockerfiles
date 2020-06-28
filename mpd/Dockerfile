# Music player daemon
#
# docker run -d \
#	--device /dev/snd \
#	-v /etc/localtime:/etc/localtime:ro \
#   -v $HOME/.mpd.conf:/etc/mpd.conf
#	-v $HOME/.mpd:/var/lib/mpd \
#	-p 6600:6600 \
#	--name mpd \
#	hyperreal/mpd
#
FROM debian:sid-slim
LABEL maintainer "Jeffrey Serio <serio.jeffrey@gmail.com"

RUN apt-get update && apt-get install -y \
	mpc \
	mpd \
	sudo \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

run mkdir -p /var/lib/mpd/playlists \
	&& mkdir -p /var/lib/mpd/music \
	&& touch /var/lib/mpd/state \
	&& touch /var/lib/mpd/tag_cache \
	&& chmod 0777 -R /var/lib/mpd \
	&& chown -R mpd /var/lib/mpd

ENV HOME /home/mpd
COPY mpd.conf /etc/mpd.conf
COPY mpd.sh /usr/local/bin/mpd.sh

WORKDIR $HOME

ENTRYPOINT [ "/usr/local/bin/mpd.sh" ]
