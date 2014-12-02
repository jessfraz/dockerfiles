# VERSION:        0.1
# DESCRIPTION:    Run text-based emacs doctor in a container
# AUTHOR:         Jessica Frazelle <jess@docker.com>
# COMMENTS:
#   This file describes how to build doctor in a container with all
#   dependencies installed. 
#   Tested on Debian Jessie
# USAGE:
#   # Download doctor Dockerfile
#   wget http://raw.githubusercontent.com/jfrazelle/dockerfiles/master/doctor/Dockerfile
#
#   # Build doctor image
#   docker build -t doctor .
#
#   docker run -it doctor
#

# Base docker image
FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

# Install emacs
RUN apt-get update && apt-get install -y \
    emacs \
    --no-install-recommends

# Autorun doctor
CMD ["/usr/bin/emacs", "-f", "doctor"]
