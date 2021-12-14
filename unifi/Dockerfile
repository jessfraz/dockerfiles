# Run the Ubiquiti UniFi Controller in a container
#
# Setup a local directory to store your unifi controller config:
# 	mkdir -p ~/.config/unifi/
# 	chmod -R 0700 ~/.config/unifi/
#
# If you have already been using a locally installed unifi controller,
# copy the contents of your existing unifi config:
#	cp -R /var/lib/unifi/* ~/.config/unifi/	# Linux
#	cp -R ~/Library/Application\ Support/UniFi/* ~/.config/unifi/ # MacOS
#
# Build the docker image (from directory with this Dockerfile & entrypoint.sh):
#	docker build -t unifi .
#
# Start a unifi controller container:
#	docker run \ # interactive mode isn't necessary
#		-v ~/.config/unifi:/config \ # for persistent config
#		-p 8080:8080 -p 8443:8443 -p 8843:8843 -p 8880:8880 -p 3478:3478/udp \
#		--name unifi \
#		unifi
#
# Access the controller in your browser at: https://127.0.0.1:8443
#
# If existing devices are showing up as "disconnected" once logged in,
# SSH into each device and run:
# 	set-inform http://ip_of_docker_host:8080/inform
#

FROM ubuntu:20.04

# environment settings
ENV DEBIAN_FRONTEND="noninteractive"

# install deps
RUN apt-get update && apt-get install -y \
	ca-certificates \
	dirmngr \
	gnupg \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

# install packages
RUN apt-get update && apt-get install -y \
	binutils \
	jsvc \
	mongodb-server \
	openjdk-8-jre-headless \
	logrotate \
	libcap2 \
	gosu \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

# unifi version
# From: https://www.ubnt.com/download/unifi/
ENV UNIFI_VERSION "6.5.54"

# install unifi
RUN apt-get update && apt-get install -y \
		curl \
		--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& curl -o /tmp/unifi.deb -L "https://dl.ubnt.com/unifi/${UNIFI_VERSION}/unifi_sysvinit_all.deb" \
	&& dpkg -i /tmp/unifi.deb \
	&& rm -rf /tmp/unifi.deb \
	&& echo "Build complete."

WORKDIR /config

# 3478 - STUN
# 8080 - device inform (http)
# 8443 - web management (https)
# 8843 - guest portal (https)
# 8880 - guest portal (http)
# 6789 - throughput / mobile speedtest (tcp)
# 10001 - device discovery (udp)
# ref https://help.ubnt.com/hc/en-us/articles/218506997-UniFi-Ports-Used
EXPOSE 3478/udp 8080 8081 8443 8843 8880 6789 10001/udp

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT [ "entrypoint.sh" ]
CMD ["java", "-Xmx1024M", "-jar", "/usr/lib/unifi/lib/ace.jar", "start"]
