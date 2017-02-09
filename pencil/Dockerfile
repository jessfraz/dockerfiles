# version: 0.0.1
# author: Vadim Sloun <github@roundside.com>
# description: dockerized Pencil (http://pencil.evolus.vn/Next.html), based on Node.js image, uses X11 socket
#
# howto
#  build image:
#   git clone loadaverage/penciil && cd ./pencil && docker build -t pencil .
#  OR pull from Docker Hub:
#   docker pull loadaverage/pencil
#
#  run container:
#
#   docker run --rm \
#    -v ~/.pencil:/home/pencil/.pencil \
#    -v ~/.config/Pencil:/home/pencil/.config/Pencil \
#    -v ~/Downloads/tmp:/home/pencil/Downloads \
#    -v /tmp/.X11-unix:/tmp/.X11-unix \
#    -e DISPLAY=$DISPLAY pencil
#
#    NOTE: mounted config directories should have correct permissions, otherwise Pencil will not start
#     for example:
#    mkdir ~/.pencil && chmod 777 ~/.pencil
#    mkdir ~/.config/Pencil && chmod 777 ~/.config/Pencil
#
#   NOTE: on Linux distros you may need explicitly allow access to X server through xhost command:
#    xhost local:pencil

#Pencil requires Node.js >= 5, using :latest tag may be unreasonably
FROM node:7.5
MAINTAINER Vadim Sloun <github@roundside.com>

#homedir for Pencil user
ENV dir /home/pencil
ENV user pencil

WORKDIR /home/pencil

#minimal dependencies and user for Pencil
RUN export DEBIAN_FRONTEND=noninteractive && \
    apt-get update && \
    apt-get upgrade -yqq && \
    apt-get install -yqq --no-install-recommends git \
      libasound2 libnss3 \
      libxss1 libxtst6 \
      libgconf-2-4 libgtk2.0-0 && apt-get clean && \
    useradd $user -s `which bash` -d $dir && \
    chown $user.$user $dir && \
    su pencil -c "git clone https://github.com/evolus/pencil && cd ./pencil && npm install --silent"

USER pencil
WORKDIR /home/pencil/pencil
CMD ["npm", "start"]
