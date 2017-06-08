FROM ubuntu:xenial
LABEL github "https://github.com/mrorgues"


#============================#
# Information & Requirements #
#============================#
# *** Run firefox in a container ***
#
# docker run --rm -it \
#   --net host \
#   -v /tmp/.X11-unix:/tmp/.X11-unix \
#   -e DISPLAY=unix$DISPLAY \
#   --device /dev/dri \
#   --device /dev/snd \
#   -v /dev/shm:/dev/shm \
#   -v /etc/machine-id:/etc/machine-id \
#   --ipc="host" \
#   --name firefox \
#   mrorgues/firefox 
#
# *** Requirements ***
#
# Docker 1.9+ is required.


#=================#
# Basics & Locale #
#=================#
COPY local.conf /etc/fonts/local.conf

ARG DEFAULT_LANGUAGE=fr_FR

ENV LANG ${DEFAULT_LANGUAGE}".UTF-8"
ENV LOCALE_GEN ${DEFAULT_LANGUAGE}".UTF-8 UTF-8"

RUN apt-get update && \
    apt-get install -y \
    apt-transport-https \
    dirmngr \
    gnupg \
    ca-certificates \
    hicolor-icon-theme \
    libasound2 \
    libgl1-mesa-dri \
    libgl1-mesa-glx \
    libcanberra-gtk3-module \
    locales \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/* && \
    echo ${LOCALE_GEN} >> /etc/locale.gen && \
    locale-gen && \
    dpkg-reconfigure locales


#=========#
# Firefox #
#=========#
ARG FIREFOX_LOCALE=firefox-locale-fr

RUN apt-get update && \
    apt-get install -y \
    firefox \
    ${FIREFOX_LOCALE} \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*


#=============#
# Here we go! #
#=============#
ENTRYPOINT [ "/usr/bin/firefox" ]
