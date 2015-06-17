# Run skype in a container
#
# docker run -v /tmp/.X11-unix:/tmp/.X11-unix \
#	-v /dev/snd:/dev/snd \
#	-e DISPLAY=unix$DISPLAY \
#	-e PULSE_SERVER=$(ip addr show eth0  | awk '/inet/ {print $2}' | cut -d/ -f1 |head -1) \ # or however you get your local address 
#	jess/skype
#
FROM debian:jessie

# Tell debconf to run in non-interactive mode
ENV DEBIAN_FRONTEND noninteractive

# Setup multiarch because Skype is 32bit only
# Make sure the repository information is up to date
RUN dpkg --add-architecture i386 && \
	apt-get update && apt-get install -y \
	curl \
	--no-install-recommends


# Install Skype
RUN curl http://download.skype.com/linux/skype-debian_4.3.0.37-1_i386.deb > /usr/src/skype.deb && \ 
	dpkg -i /usr/src/skype.deb && \
	apt-get install -fy \
	&& rm -rf /var/lib/apt/lists/*

# Start Skype
ENTRYPOINT ["skype"]
