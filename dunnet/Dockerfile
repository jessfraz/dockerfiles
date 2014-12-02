# VERSION:        0.1
# DESCRIPTION:    Run text-based game dunnet in a container
# AUTHOR:         Jessica Frazelle <jess@docker.com>
# COMMENTS:
#   This file describes how to build dunnet in a container with all
#   dependencies installed.
#   Tested on Debian Jessie
# USAGE:
#   # Download dunnet Dockerfile
#   wget http://raw.githubusercontent.com/jfrazelle/dockerfiles/master/dunnet/Dockerfile
#
#   # Build dunnet image
#   docker build -t dunnet .
#
#   docker run -it dunnet
#

# Base docker image
FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

# Install emacs
RUN apt-get update && apt-get install -y \
    emacs \
    --no-install-recommends

# Autorun dunnet
CMD ["/usr/bin/emacs", "-batch", "-l", "dunnet"]
