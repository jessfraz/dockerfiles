# DESCRIPTION:	  Create the atom editor in a container
# AUTHOR:		  Jessie Frazelle <jess@linux.com>
# COMMENTS:
#	This file describes how to build the atom editor
#	in a container with all dependencies installed.
#	Note: atom is not a node-webkit app,
#	found this out a little too late into this example
#	it uses electron(https://github.com/atom/electron)
#	Tested on Debian Jessie.
# USAGE:
#	# Download atom Dockerfile
#	wget https://raw.githubusercontent.com/jessfraz/dockerfiles/master/atom/Dockerfile
#
#	# Build atom image
#	docker build -t atom .
#
#	docker run -v /tmp/.X11-unix:/tmp/.X11-unix \
#		-e DISPLAY=unix$DISPLAY atom
#

# Base docker image
FROM debian:bullseye-slim

LABEL maintainer "Jessie Frazelle <jess@linux.com>"

ARG USER_INSIDE_THE_CONTAINER=me
ARG HOME_INSIDE_THE_CONTAINER=home

# Tell debconf to run in non-interactive mode
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y \
	apt-transport-https \
	ca-certificates \
	gnupg \
	wget \
	--no-install-recommends

# Add the atom debian repo
RUN wget -qO- https://packagecloud.io/AtomEditor/atom/gpgkey | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] https://packagecloud.io/AtomEditor/atom/any/ any main" > /etc/apt/sources.list.d/atom.list'

# Install dependencies
RUN apt-get update && apt-get install -y \
	atom \
	git \
	gconf2 \
	gconf-service \
	gvfs-bin \
	libasound2 \
	libcap2 \
	libgconf-2-4 \
	libgtk2.0-0 \
	libnotify4 \
	libnss3 \
	libxkbfile1 \
	libxss1 \
	libxtst6 \
	libx11-xcb-dev \
	xdg-utils \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN mkdir -p /${HOME_INSIDE_THE_CONTAINER}/${USER_INSIDE_THE_CONTAINER}/repos

RUN useradd -rm -d /${HOME_INSIDE_THE_CONTAINER}/${USER_INSIDE_THE_CONTAINER} -s /bin/bash -g root \
-p "$(openssl passwd -1 ${USER_INSIDE_THE_CONTAINER})" -G sudo -u 1000 ${USER_INSIDE_THE_CONTAINER}
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

RUN chown -R ${USER_INSIDE_THE_CONTAINER}: /${HOME_INSIDE_THE_CONTAINER}/${USER_INSIDE_THE_CONTAINER}/

USER ${USER_INSIDE_THE_CONTAINER}

# Autorun atom
ENTRYPOINT [ "atom", "--foreground" ]
