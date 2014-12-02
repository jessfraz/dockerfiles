# VERSION:        0.1
# DESCRIPTION:    Run text-based emacs tetris in a container
# AUTHOR:         Jessica Frazelle <jess@docker.com>
# COMMENTS:
#   This file describes how to build tetris in a container with all
#   dependencies installed. 
#   Tested on Debian Jessie
# USAGE:
#   # Download tetris Dockerfile
#   wget http://raw.githubusercontent.com/jfrazelle/dockerfiles/master/tetris/Dockerfile
#
#   # Build tetris image
#   docker build -t tetris .
#
#   docker run -it tetris
#

# Base docker image
FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

# Install emacs
RUN apt-get update && apt-get install -y \
    emacs \
    --no-install-recommends

# Autorun tetris
CMD ["/usr/bin/emacs", "-f", "tetris"]
