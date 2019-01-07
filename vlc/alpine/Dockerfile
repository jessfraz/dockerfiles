# VLC media player
#
#docker run --rm -d \
#    -v /etc/localtime:/etc/localtime:ro \
#    -v /etc/machine-id:/etc/machine-id:ro \
#    -v /tmp/.X11-unix:/tmp/.X11-unix \
#    -e "DISPLAY=unix${DISPLAY}" \
#    -e GDK_SCALE \
#    -e GDK_DPI_SCALE \
#    -e QT_DEVICE_PIXEL_RATIO \
#    --group-add audio \
#    --group-add video \
#    -v "${HOME}/Torrents:/home/vlc/Torrents" \
#    --device /dev/dri \
#    --device /dev/snd \
#    --device /dev/video0 \
#    --name vlc \
#    "westonsteimel/vlc:alpine" "$@"
#

FROM alpine:edge

RUN apk upgrade --no-cache && apk add --no-cache \
    alsa-lib \
    dbus-x11 \
    mesa-dri-intel \
	mesa-gl \
    qt-x11 \
	vlc-qt

# Add vlc user
RUN addgroup vlc \
    && adduser -G vlc -D vlc \
    && addgroup vlc audio \
    && addgroup vlc video

# Run vlc as non privileged user
USER vlc

ENTRYPOINT [ "vlc" ]
