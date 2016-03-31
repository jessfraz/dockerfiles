# Run spotify in a container
#
# docker run -d \
#	-v /etc/localtime:/etc/localtime:ro \
#	-v /tmp/.X11-unix:/tmp/.X11-unix \
#	-e DISPLAY=unix$DISPLAY \
#	--device /dev/snd:/dev/snd \
#	-v $HOME/.spotify/config:/home/spotify/.config/spotify \
#	-v $HOME/.spotify/cache:/home/spotify/spotify \
#	--name spotify \
#	jess/spotify
#
FROM ubuntu:14.04
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	alsa-utils \
	libpangoxft-1.0-0 \
	xdg-utils \
	software-properties-common \
	--no-install-recommends \
	&& apt-key adv --keyserver keyserver.ubuntu.com --recv-keys BBEBDCB318AD50EC6865090613B00F1FD2C19886 \
	&& echo "deb http://repository.spotify.com stable non-free" >> /etc/apt/sources.list.d/spotify.list \
	&& apt-get update \
	&& apt-get install --force-yes -y \
	spotify-client \
	&& apt-get purge --auto-remove -y software-properties-common \
	&& rm -rf /var/lib/apt/lists/*

ENV HOME /home/spotify
RUN useradd --create-home --home-dir $HOME spotify \
	&& gpasswd -a spotify audio \
	&& chown -R spotify:spotify $HOME

WORKDIR $HOME
USER spotify

# make search bar text better
RUN echo "QLineEdit { color: #000 }" > /home/spotify/spotify-override.css

ENTRYPOINT	[ "spotify" ]
CMD [ "-stylesheet=/home/spotify/spotify-override.css" ]
