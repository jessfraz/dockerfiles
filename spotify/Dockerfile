# Run spotify in a container
#
# Note: You might have to uncheck "Enable hardware acceleration" in the preferences.
FROM ubuntu:14.04
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	libpangoxft-1.0-0 \
	software-properties-common \
	pulseaudio \
	--no-install-recommends && \
	apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 94558F59 && \
	echo "deb http://repository.spotify.com stable non-free" >> /etc/apt/sources.list.d/spotify.list && \
	apt-get update && \
	apt-get install --force-yes -y \
	spotify-client \
	&& rm -rf /var/lib/apt/lists/*

ENV HOME /home/spotify
RUN useradd --create-home --home-dir $HOME spotify \
	&& gpasswd -a spotify audio \
	&& chown -R spotify:spotify $HOME

WORKDIR $HOME
USER spotify

# make search bar text better
RUN echo "QLineEdit { color: #000 }" > /home/spotify/spotify-override.css

# make dbus socket a real file so we can get at it through the filesystem
ADD session-local.conf /etc/dbus-1/session-local.conf

ENTRYPOINT [ "spotify" ]
CMD [ "-stylesheet=/home/spotify/spotify-override.css" ]
