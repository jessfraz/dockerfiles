# Run Libreoffice in a Ubuntu 20.04 container
# Example launch:
# docker run -it --rm -d -v /tmp/.X11-unix:/tmp/.X11-unix \
# 			 -v $HOME:/home/me -e DISPLAY=$DISPLAY tsanov/libreoffice
#
FROM ubuntu:20.04
LABEL maintainer "Nikolay Tsanov <hitechsmes@gmail.com>"

ENV DEBIAN_FRONTEND noninteractive

RUN apt update && apt install -y sudo apt-utils bash xterm
RUN apt install -y -q libreoffice
RUN apt install -y -q openjdk-8-jre \
				fonts-opensymbol \
				hyphen-fr \
				hyphen-en-us \
				fonts-dejavu \
				fonts-dejavu-core \
				fonts-dejavu-extra \
				fonts-freefont-ttf \
				fonts-liberation
RUN useradd -ms /bin/bash me
USER me
WORKDIR /home/me
ENTRYPOINT [ "libreoffice" ]
