# VERSION:        0.1
# DESCRIPTION:    Create transmission container with its dependencies
# AUTHOR:         Jessica Frazelle <jess@docker.com>
# COMMENTS:
#   This file describes how to build a transmission container with all
#   dependencies installed. It uses native X11 unix socket. 
#   Tested on Debian Jessie
# USAGE:
#   # Download transmission Dockerfile
#   wget http://raw.githubusercontent.com/jfrazelle/dockerfiles/master/transmission/Dockerfile
#
#   # Build transmission image
#   docker build -t transmission .
#
#   docker run -v /tmp/.X11-unix:/tmp/.X11-unix \
#     -v /home/jessie/Torrents:/Torrents \
#     -e DISPLAY=unix$DISPLAY transmission
#

# Base docker image
FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

# Install transmission and its dependencies
RUN apt-get update && apt-get install -y \
    transmission-cli \
    transmission-common \
    transmission-daemon \
    transmission-gtk \
    --no-install-recommends

# Autorun transmission
CMD ["/usr/bin/transmission-gtk"]
