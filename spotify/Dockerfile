# Run spotify in a container
#
# docker run -d \
#	-v /etc/localtime:/etc/localtime:ro \
#	-v /tmp/.X11-unix:/tmp/.X11-unix \
#	-e DISPLAY=unix$DISPLAY \
#	--device /dev/snd:/dev/snd \
#	-v $HOME/.config/spotify:/home/spotify/.config/spotify \
#	-v $HOME/.cache/spotify:/home/spotify/.cache/spotify \
#	--name spotify \
#	jess/spotify
#
FROM debian:sid-slim
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN	apt-get update && apt-get install --no-install-recommends --yes \
	ca-certificates \
	curl \
	dirmngr \
	gnupg \
	&& curl -sS https://download.spotify.com/debian/pubkey_7A3A762FAFD4A51F.gpg | gpg --dearmor --yes -o /etc/apt/trusted.gpg.d/spotify.gpg \
	&& echo "deb http://repository.spotify.com stable non-free" >> /etc/apt/sources.list.d/spotify.list \
	&& apt-get update && apt-get install --no-install-recommends --yes \
	alsa-utils \
	libgl1-mesa-dri \
	libgl1-mesa-glx \
	libpulse0 \
	libsm6 \
	spotify-client \
	xdg-utils \
	fonts-droid-fallback \
	libcanberra-gtk3-module \
	&& apt-get remove --yes \
	ca-certificates \
	curl \
	dirmngr \
	gnupg \
	&& apt-get autoremove --yes \
	&& rm -rf /var/lib/apt/lists/*

ENV HOME /home/spotify
RUN useradd --create-home --home-dir $HOME spotify \
	&& gpasswd -a spotify audio \
	&& mkdir $HOME/.config $HOME/.cache \
	&& chown -R spotify:spotify $HOME

WORKDIR $HOME
USER spotify

# make search bar text better
RUN echo "QLineEdit { color: #000 }" > /home/spotify/spotify-override.css

ENTRYPOINT	[ "spotify" ]
CMD [ "-stylesheet=/home/spotify/spotify-override.css" ]
