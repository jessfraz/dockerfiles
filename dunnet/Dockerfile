# VERSION:		  0.1
# DESCRIPTION:	  Run text-based game dunnet in a container
# AUTHOR:		  Jessica Frazelle <jess@docker.com>
# COMMENTS:
#	This file describes how to build dunnet in a container with all
#	dependencies installed.
#	Tested on Debian Jessie
# USAGE:
#	# Download dunnet Dockerfile
#	wget http://raw.githubusercontent.com/jfrazelle/dockerfiles/master/dunnet/Dockerfile
#
#	# Build dunnet image
#	docker build -t dunnet .
#
#	docker run -it dunnet
#

# Base docker image
FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

# Install emacs:
# Note: Eamcs is only in testing repo -> http://pkgs.alpinelinux.org/packages?package=emacs&repo=all&arch=x86_64
RUN apk update && apk add \
	emacs \
	--update-cache --repository http://dl-3.alpinelinux.org/alpine/edge/testing/ \
	&& rm -rf /var/cache/apk/*

# Autorun dunnet
CMD ["/usr/bin/emacs", "-batch", "-l", "dunnet"]
