# Run spotify windows app in a container with wine
#
# docker run --rm -it \
#   -v /etc/localtime:/etc/localtime:ro \
#   --cpuset-cpus 0 \
#   -v /tmp/.X11-unix:/tmp/.X11-unix  \
#   -e DISPLAY=unix$DISPLAY \
#   --device /dev/snd:/dev/snd \
#   --name spotify-wine \
#   jess/spotify-wine bash
#
FROM debian:jessie
MAINTAINER Jessie Frazelle <jess@linux.com>

# install wine
# and iceweasel since we have to sign in w facebook
# GROSS
RUN apt-get update && apt-get install -y \
    wine \
    --no-install-recommends && \
    dpkg --add-architecture i386 && \
    apt-get update && \
    apt-get install -y \
    wine32

COPY ./SpotifySetup.exe /usr/src/SpotifySetup.exe

CMD [ "wine", "/usr/src/SpotifySetup.exe" ]
