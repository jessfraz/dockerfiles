# irssi with notifications
#
#  docker run -it --rm \
#    -v /etc/timezone:/etc/timezone \
#    -v /etc/localtime:/etc/localtime \
#    -v /home/jessie/.irssi:/root/.irssi \
#    -v /tmp/.X11-unix:/tmp/.X11-unix \
#    -e DISPLAY=unix$DISPLAY \
#    jess/irssi

FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

ENV LANG C.UTF-8

RUN apt-get update && apt-get install -y \
    dunst \
    irssi \
    libdatetime-perl \
    libnotify-bin \
    libwww-perl \
    --no-install-recommends

COPY ./.dunstrc /root/.dunstrc

CMD [ "irssi" ]
