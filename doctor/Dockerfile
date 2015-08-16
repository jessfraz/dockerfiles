# VERSION:		  0.1
# DESCRIPTION:	  Run text-based emacs doctor in a container
# AUTHOR:		  Jessica Frazelle <jess@docker.com>
# COMMENTS:
#	This file describes how to build doctor in a container with all
#	dependencies installed. 
#	Tested on Debian Jessie
# USAGE:
#	# Download doctor Dockerfile
#	wget http://raw.githubusercontent.com/jfrazelle/dockerfiles/master/doctor/Dockerfile
#
#	# Build doctor image
#	docker build -t doctor .
#
#	docker run -it jess/doctor
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

# Autorun doctor
CMD ["/usr/bin/emacs", "-f", "doctor"]
