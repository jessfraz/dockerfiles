# Pulseaudio
#
# docker run -d \
#	-v /etc/localtime:/etc/localtime:ro \
#	--device /dev/snd \
#	--name pulseaudio \
#	-p 4713:4713 \
#	-v /var/run/dbus:/var/run/dbus \
#	-v /etc/machine-id:/etc/machine-id \
#	jess/pulseaudio
#
FROM debian:sid
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	alsa-utils \
	libasound2 \
	libasound2-plugins \
	pulseaudio \
	pulseaudio-utils \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV HOME /home/pulseaudio
RUN useradd --create-home --home-dir $HOME pulseaudio \
	&& usermod -aG audio,pulse,pulse-access pulseaudio \
	&& chown -R pulseaudio:pulseaudio $HOME

WORKDIR $HOME
USER pulseaudio

COPY default.pa /etc/pulse/default.pa
COPY client.conf /etc/pulse/client.conf
COPY daemon.conf /etc/pulse/daemon.conf

ENTRYPOINT [ "pulseaudio" ]
CMD [ "--log-level=4", "--log-target=stderr", "-v" ]
