# version: 0.0.1
# author: Vadim Sloun <github@roundside.com>
# description: Dockerized Freemind ("http://freemind.sourceforge.net/"), based on Debian Jessie, uses X11 socket
#
# howto
#
#   build image: 
#    docker build -t freemind .
#
#   run container: 
#    docker run \
#      -v ~/Downloads/tmp:/tmp \
#      -v /tmp/.X11-unix:/tmp/.X11-unix \
#      -e DISPLAY=$DISPLAY freemind
#
#   NOTE: on Linux distros you may need explicitly allow access to X server through xhost command: 
#    xhost local:root
#

FROM debian:jessie
MAINTAINER Vadim Sloun <github@roundside.com>

#minimal dependencies
RUN apt-get update && apt-get upgrade -yqq && \
    apt-get install -yqq freemind --no-install-recommends

#run Freemind
CMD ["/usr/bin/freemind"]
