# DESCRIPTION:	  Termboy in a container
# AUTHOR:		  Jessie Frazelle <jess@linux.com>
# COMMENTS:
#	This file describes how to build termboy
#	in a container with all dependencies installed.
#	Tested on Debian Jessie.
# USAGE:
#	# Download termboy Dockerfile
#	wget https://raw.githubusercontent.com/jessfraz/dockerfiles/master/termboy/Dockerfile
#
#	# Build termboy image
#	docker build -t termboy .
#
#	docker run -it \
#		--device /dev/snd \
#		termboy
#

# Base docker image
FROM debian:bullseye-slim
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

ENV DEBIAN_FRONTEND noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
	ca-certificates \
	console-setup \
	console-setup-linux \
	g++ \
	git \
	kbd \
	libasound2-dev \
	libncurses5-dev \
	libncursesw5-dev \
	make \
	sudo \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 https://github.com/dobyrch/termboy /src \
	&& cd /src \
	&& make \
	&& make install || true


# add games
COPY games /games

# Autorun termboy
ENTRYPOINT ["/usr/bin/termboy"]
