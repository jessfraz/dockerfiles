# Music player daemon
#
# docker run -d \
#	-v /etc/localtime:/etc/localtime:ro \
#	-v $HOME/.mpd:/var/lib/mpd \
#	-p 8000:8000 \
#	-p 6600:6600 \
#	--name mpd \
#	jess/mpd	 
#
FROM debian:sid
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	mpd \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

run mkdir -p /var/lib/mpd/playlists \
	&& mkdir -p /var/lib/mpd/music \
	&& touch /var/lib/mpd/state \
	&& touch /var/lib/mpd/tag_cache \
	&& chmod 0777 -R /var/lib/mpd \
	&& chown -R mpd /var/lib/mpd

EXPOSE 6600 8000

ENV HOME /home/mpd
COPY mpd.conf /etc/mpd.conf
COPY mpd.sh /usr/local/bin/mpd.sh

WORKDIR $HOME
USER mpd

ENTRYPOINT [ "/usr/local/bin/mpd.sh" ]
