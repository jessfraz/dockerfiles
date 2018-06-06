# version: 0.0.2
# author: Vadim Sloun <github@roundside.com>
# description: dockerized Pencil (http://pencil.evolus.vn/Next.html), based on Node.js image, uses X11 socket
#
#  run container:
#
#   docker run --rm \
#     -v ~/Downloads/pencil:/home/pencil/Downloads \
#     -v ~/.pencil:/home/pencil/.pencil \
#     -v ~/.config/Pencil:/home/pencil/.config/Pencil \
#     -v ~/.themes:/home/pencil/.themes:ro \
#     -v ~/.fonts:/home/pencil/.fonts:ro \
#     -v ~/.icons:/home/pencil/.icons:ro \
#     -v ~/.gtkrc-2.0:/home/pencil/.gtkrc-2.0:ro \
#     -v /usr/share/themes:/usr/share/themes:ro \
#     -v /usr/share/fonts:/usr/share/fonts:ro \
#     -v /tmp/.X11-unix:/tmp/.X11-unix \
#     -e DISPLAY=$DISPLAY pencil
#
#    NOTE: mounted config directories should have correct permissions, otherwise Pencil will not start
#     for example:
#    mkdir ~/.pencil && chmod 777 ~/.pencil
#    mkdir ~/.config/Pencil && chmod 777 ~/.config/Pencil
#
#   NOTE: on Linux distros you may need explicitly allow access to X server through xhost command:
#    xhost local:pencil

FROM node:7.5
MAINTAINER Vadim Sloun <github@roundside.com>

ENV dir /home/pencil
ENV user pencil

WORKDIR /home/pencil

RUN export DEBIAN_FRONTEND=noninteractive && \
    apt-get update && \
    apt-get upgrade -yqq && \
    apt-get install -yqq --no-install-recommends git \
      libasound2 libnss3 \
      libxss1 libxtst6 \
      libgconf-2-4 libgtk2.0-0 && apt-get clean && \
    useradd $user -s `which bash` -d $dir && \
    chown $user.$user $dir && \
    su pencil -c "git clone https://github.com/evolus/pencil && cd ./pencil && npm install --silent && rm -rf ./.git"

USER pencil
WORKDIR /home/pencil/pencil
CMD ["npm", "start"]
