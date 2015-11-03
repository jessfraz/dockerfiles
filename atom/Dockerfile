# VERSION:		  0.1
# DESCRIPTION:	  Create the atom editor in a container
# AUTHOR:		  Jessica Frazelle <jess@docker.com>
# COMMENTS:
#	This file describes how to build the atom editor
#	in a container with all dependencies installed.
#	Note: atom is not a node-webkit app,
#	found this out a little too late into this example
#	it uses electron(https://github.com/atom/electron)
#	Tested on Debian Jessie.
# USAGE:
#	# Download atom Dockerfile
#	wget http://raw.githubusercontent.com/jfrazelle/dockerfiles/master/atom/Dockerfile
#
#	# Build atom image
#	docker build -t atom .
#
#	docker run -v /tmp/.X11-unix:/tmp/.X11-unix \
#		-e DISPLAY=unix$DISPLAY atom
#

# Base docker image
FROM jess/chromium
MAINTAINER Jessica Frazelle <jess@docker.com>

# Install dependencies
RUN apt-get update && apt-get install -y \
	ca-certificates \
	curl \
	gconf2 \
	gconf-service \
	git \
	gvfs-bin \
	libasound2 \
	libgconf-2-4 \
	libgnome-keyring-dev \
	libgtk2.0-0 \
	libnotify4 \
	libnss3 \
	libxtst6 \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV ATOM_VERSION 1.1.0

RUN curl -sSL https://github.com/atom/atom/releases/download/v${ATOM_VERSION}/atom-amd64.deb -o /tmp/atom-amd64.deb \
	&& dpkg -i /tmp/atom-amd64.deb \
	&& rm -rf /tmp

# Autorun atom
ENTRYPOINT [ "atom", "--foreground" ]
