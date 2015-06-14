# VERSION:		  0.1
# DESCRIPTION:	  Create the atom editor in a container 
# AUTHOR:		  Jessica Frazelle <jess@docker.com>
# COMMENTS:
#	This file describes how to build the atom editor 
#	in a container with all dependencies installed.
#	Note: atom is not a node-webkit app,
#	found this out a little too late into this example
#	it uses atom-shell(https://github.com/atom/atom-shell)
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
FROM node
MAINTAINER Jessica Frazelle <jess@docker.com>

# Install dependencies
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    libasound2 \
    libgconf-2-4 \
    libgnome-keyring-dev \
    libgnome-keyring-dev \
    libgtk2.0-0 \
    libnss3 \
    libxtst6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /src

RUN LATEST_TAG=`git ls-remote --tags https://github.com/atom/atom | sort -t '/' -k3 --version-sort | tail -n1 | cut -d'/' -f3` && \
    git clone -b $LATEST_TAG https://github.com/atom/atom --depth 1 /src && \
    script/build && script/grunt install && \
    rm -fr /src

# Autorun atom
CMD /usr/local/bin/atom --foreground --log-file /var/log/atom.log && tail -f /var/log/atom.log
