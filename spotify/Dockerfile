# Run spotify in a container
#
# docker run -d \
#	-v /etc/localtime:/etc/localtime:ro \
#	-v /tmp/.X11-unix:/tmp/.X11-unix \
#	-e DISPLAY=unix$DISPLAY \
#	--device /dev/snd \
#	-v $HOME/.spotify/config:/home/spotify/.config \
#	-v $HOME/.spotify/cache:/home/spotify/spotify \
#	--name spotify \
#	jess/spotify
#
FROM debian:sid-slim
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN	apt-get update && apt-get install -y \
	dirmngr \
	gnupg \
	--no-install-recommends \
	&& apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 4773BD5E130D1D45 \
	&& echo "deb http://repository.spotify.com stable non-free" >> /etc/apt/sources.list.d/spotify.list \
	&& apt-get update && apt-get install -y \
	alsa-utils \
	libgl1-mesa-dri \
	libgl1-mesa-glx \
	libpulse0 \
	spotify-client \
	xdg-utils \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ARG HOSTUID=1000
ARG HOSTGID=1000

ENV HOME /home/spotify
RUN groupadd -g $HOSTGID spotify \
	&& useradd -u $HOSTUID -g $HOSTGID --create-home --home-dir $HOME spotify \
	&& gpasswd -a spotify audio \
	&& chown -R spotify:spotify $HOME

WORKDIR $HOME
USER spotify

# make search bar text better
RUN echo "QLineEdit { color: #000 }" > /home/spotify/spotify-override.css

ENTRYPOINT	[ "spotify" ]
CMD [ "-stylesheet=/home/spotify/spotify-override.css" ]
