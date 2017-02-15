# version: 0.0.2
# author: Vadim Sloun <github@roundside.com>
# description: Dockerized Freemind (v1.0.1 Beta 2) ("http://freemind.sourceforge.net/"), based on Ubuntu 16.10, uses X11 socket
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
#    NOTE: mounted config directories should have correct permissions, otherwise Freemind will not work properly.
#     For example:
#      mkdir ~/.freemind && chmod 777 ~/.freemind
#
#    NOTE: on Linux distros you may need explicitly allow access to X server through xhost command:
#      xhost local:freemind

FROM ubuntu:16.10
WORKDIR /opt/freemind

ENV dir /home/freemind
ENV user freemind
ENV fm /opt/freemind/freemind.sh
ENV fmlink /usr/local/bin/freemind

RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get upgrade -yqq && \
  apt-get install -yqq wget ca-certificates unzip default-jre \
  libjgoodies-forms-java libjibx1.2-java libjibx-java libjibx1.2-java \
  libjibx-java libxpp3-java libgnu-regexp-java simplyhtml libxalan2-java \
  xdg-utils java-wrappers --no-install-recommends && apt-get clean && \
  useradd $user -s `which bash` -d $dir && mkdir $dir && chown $user.$user $dir && \
  wget --quiet "https://downloads.sourceforge.net/project/freemind/freemind-unstable/1.1.0_Beta2/freemind-bin-max-1.1.0_Beta_2.zip" \
   -O ./freemind.zip && unzip freemind.zip && rm freemind.zip && \
  chmod +x $fm && ln -s $fm $fmlink && export FREEMIND_BASE_DIR=/opt/freemind

USER freemind
CMD ["freemind"]
