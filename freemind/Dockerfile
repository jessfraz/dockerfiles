# version: 0.0.3
# description: Dockerized Freemind (v1.0.1 Beta 2), based on Alpine Linux, uses X11 socket
#
# howto
#
#   build image:
#    docker build -t freemind .
#
#   run container:
#    docker run --rm \
#      -v ~/Downloads/freemind:/home/freemind/Downloads \
#      -v ~/.freemind:/home/freemind/.freemind/ \
#      -v ~/.themes:/home/freemind/.themes:ro \
#      -v ~/.fonts:/home/freemind/.fonts:ro \
#      -v ~/.icons:/home/freemind/.icons:ro \
#      -v /usr/share/themes:/usr/share/themes:ro \
#      -v /usr/share/fonts:/usr/share/fonts:ro \
#      -v /tmp/.X11-unix:/tmp/.X11-unix \
#      -e DISPLAY=$DISPLAY freemind
#
#    NOTES:
#     Volumes: mounted config directories should have correct permissions, otherwise Freemind will not work properly
#     Xhost: on Linux distros you may need explicitly allow access to X server through xhost command: xhost local:freemind
#     Fonts: font settings for JRE: https://wiki.archlinux.org/index.php/Java_Runtime_Environment_fonts#Anti-aliasing

FROM alpine
LABEL maintainer="VS <github@roundside.com"

ENV FREEMIND_BASE_DIR /home/freemind
ENV FU freemind
ENV FMURL "https://downloads.sourceforge.net/project/freemind/freemind-unstable/1.1.0_Beta2/freemind-bin-max-1.1.0_Beta_2.zip"
ENV _JAVA_OPTIONS '-Dawt.useSystemAAFontSettings=gasp'

WORKDIR /home/$FU

RUN apk update && apk upgrade && apk add \
     openjdk8-jre \
     ttf-dejavu \
     fontconfig \
     wget && \
     wget --quiet $FMURL -O fm.zip && \
     unzip fm.zip && rm fm.zip && \
     chmod +x freemind.sh && \
     adduser $FU -S -s /bin/sh && chown -R $FU.nogroup /home/$FU

USER $FU
CMD ["/home/freemind/freemind.sh"]
