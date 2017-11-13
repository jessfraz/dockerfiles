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
FROM debian:sid
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN	apt-get update && apt-get install -y \
	dirmngr \
	gnupg \
	--no-install-recommends \
	&& apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 0DF731E45CE24F27EEEB1450EFDC8610341D9410 \
	&& echo "deb http://repository.spotify.com stable non-free" >> /etc/apt/sources.list.d/spotify.list \
	&& echo "deb http://ftp.de.debian.org/debian jessie main " >> /etc/apt/sources.list.d/workaround.list \
	&& apt-get update && apt-get install -y \
	alsa-utils \
	libgl1-mesa-dri \
	libgl1-mesa-glx \
	libpangoxft-1.0-0 \
	libpulse0 \
	libssl1.0.0 \
	libssl1.0.2 \
	libxss1 \
	spotify-client \
	xdg-utils \
	--no-install-recommends \
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
