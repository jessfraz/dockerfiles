# VERSION:		  0.1
# DESCRIPTION:	  Termboy in a container 
# AUTHOR:		  Jessica Frazelle <jess@docker.com>
# COMMENTS:
#	This file describes how to build termboy
#	in a container with all dependencies installed.
#	Tested on Debian Jessie.
# USAGE:
#	# Download termboy Dockerfile
#	wget http://raw.githubusercontent.com/jfrazelle/dockerfiles/master/termboy/Dockerfile
#
#	# Build termboy image
#	docker build -t termboy .
#
#	docker run -it termboy
#

# Base docker image
FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

ENV TERM linux
ENV HOME /root
ENV DEBIAN_FRONTEND noninteractive

COPY termboy-go /usr/bin/termboy-go

# Install dependencies
RUN apt-get update && apt-get install -y \
	kbd \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& mkdir -p $HOME/.config/termboy

# add games
COPY games $HOME/games

# Autorun termboy
ENTRYPOINT ["/usr/bin/termboy-go"]
