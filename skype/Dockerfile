# Run skype in a container, requires pulseaudio
# (but I have a container for that)
#
# docker run -v /tmp/.X11-unix:/tmp/.X11-unix \
#	-v $HOME/.Skype:/home/skype/.Skype \
#	-e DISPLAY=unix$DISPLAY \
#	--link pulseaudio:pulseaudio \
#	-e PULSE_SERVER=pulseaudio \
#	--device /dev/video0 \
#	--name skype \
#	jess/skype
#
FROM debian:jessie

# Tell debconf to run in non-interactive mode
ENV DEBIAN_FRONTEND noninteractive

# Setup multiarch because Skype is 32bit only
# Make sure the repository information is up to date
RUN dpkg --add-architecture i386 && \
	apt-get update && apt-get install -y \
	ca-certificates \
	curl \
	--no-install-recommends

ENV SKYPE_VERSION 4.3.0.37-1

# Install Skype
RUN curl -sSL "https://download.skype.com/linux/skype-debian_${SKYPE_VERSION}_i386.deb" > /usr/src/skype.deb && \
	dpkg --force-depends -i /usr/src/skype.deb && \
	apt-get install -fy \
	&& rm -rf /var/lib/apt/lists/*

# Make a user
ENV HOME /home/skype
RUN useradd --create-home --home-dir $HOME skype \
	&& chown -R skype:skype $HOME \
	&& usermod -a -G audio,video skype

WORKDIR $HOME
USER skype

# Start Skype
ENTRYPOINT ["skype"]
