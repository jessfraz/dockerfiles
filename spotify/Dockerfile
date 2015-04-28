# Run spotify in a container
#
# docker run -d \
#   -v /etc/localtime:/etc/localtime:ro \
#   -v /tmp/.X11-unix:/tmp/.X11-unix \
#   -e DISPLAY=unix$DISPLAY \
#   --device /dev/snd:/dev/snd \
#   -v $HOME/.spotify/config:/root/.config/spotify \
#   -v $HOME/.spotify/cache:/root/.cache/spotify \
#   --name spotify \
#   jess/spotify
#
FROM ubuntu:14.04
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
    libpangoxft-1.0-0 \
    alsa-utils \
    software-properties-common \
    --no-install-recommends && \
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 94558F59 && \
    echo "deb http://repository.spotify.com stable non-free" >> /etc/apt/sources.list.d/spotify.list && \
    apt-get update && \
    apt-get install -y \
    spotify-client

ENTRYPOINT  [ "/usr/bin/spotify" ]
