# mplayer meant for music streams
#
# docker run -d --name mplayer --device /dev/snd jess/mplayer-music \
#       http://icecast.vrtcdn.be/stubru-high.mp3
#
# (replace http://icecast.vrtcdn.be/stubru-high.mp3 by some stream)
#
FROM alpine:latest
LABEL maintainer "Nikolas Garofil <nikolas@garofil.be>"
RUN apk --no-cache add mplayer
ENTRYPOINT ["mplayer"]
