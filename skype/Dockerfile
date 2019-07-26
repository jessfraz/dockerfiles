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
FROM debian:bullseye-slim

# Tell debconf to run in non-interactive mode
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y \
	apt-transport-https \
	ca-certificates \
	curl \
	gnupg \
	procps \
	--no-install-recommends

# Add the skype debian repo
RUN curl -sSL https://repo.skype.com/data/SKYPE-GPG-KEY | apt-key add -
RUN echo "deb [arch=amd64] https://repo.skype.com/deb stable main" > /etc/apt/sources.list.d/skype.list

RUN apt-get update && apt-get -y install \
	skypeforlinux \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

COPY run-skype-and-wait-for-exit /usr/local/bin

# Make a user
ENV HOME /home/skype
RUN useradd --create-home --home-dir $HOME skype \
	&& chown -R skype:skype $HOME \
	&& usermod -a -G audio,video skype

WORKDIR $HOME
USER skype

# Start Skype
ENTRYPOINT ["run-skype-and-wait-for-exit"]

