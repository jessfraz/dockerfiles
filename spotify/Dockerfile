# Run spotify in a container
#
# Note: You might have to uncheck "Enable hardware acceleration" in the preferences.
FROM ubuntu:14.04
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN \
	apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys BBEBDCB318AD50EC6865090613B00F1FD2C19886 && \
	echo "deb http://repository.spotify.com testing non-free" >> /etc/apt/sources.list.d/spotify.list && \
	apt-get update && \
	apt-get install -y --no-install-recommends \
	  libpangoxft-1.0-0 \
	  software-properties-common \
	  xdg-utils \
	  libxss1 \
	  pulseaudio \
	  spotify-client \
	  && \
	rm -rf /var/lib/apt/lists/*

ENV HOME /home/spotify
RUN useradd --create-home --home-dir $HOME spotify \
	&& gpasswd -a spotify audio \
	&& chown -R spotify:spotify $HOME

WORKDIR $HOME
USER spotify

# make search bar text better
RUN echo "QLineEdit { color: #000 }" > /home/spotify/spotify-override.css

# add wrapper script
ADD startup /usr/bin/startup

ENTRYPOINT [ "startup" ]
