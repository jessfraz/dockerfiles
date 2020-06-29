FROM debian:sid-slim AS builder
LABEL maintainer "Jeffrey Serio <serio.jeffrey@gmail.com>"

ENV VIMPC_VERSION 0.09.2
ENV LANG C.UTF-8

RUN apt-get update && DEBIAN_FRONTEND=noninteractive \
    apt-get install -y \
    pkg-config \
    libcurl4-openssl-dev \
    build-essential \
    autoconf \
    libmpdclient2 \
    libmpdclient-dev \
    libpcre3 \
    libpcre3-dev \
    libncursesw5 \
    libncursesw5-dev \
    libncurses5-dev \
    libtagc0 \
    libtagc0-dev \   
    tar \
    pigz \
    wget \
    && rm -rf /var/lib/apt/lists/*

RUN cd /usr/src \
    && wget https://github.com/boysetsfrog/vimpc/archive/v${VIMPC_VERSION}.tar.gz -O /tmp/vimpc.tar.gz \
    && pigz -dc /tmp/vimpc.tar.gz | tar xv \
    && cd vimpc-${VIMPC_VERSION} \
    && ./autogen.sh \
    && ./configure \
    && make \
    && make install \
    && cd /usr/src && rm -rf vimpc-${VIMPC_VERSION} \
    && rm -rf /tmp/vimpc.tar.gz \
    && mkdir /mpd

ENTRYPOINT [ "/usr/local/bin/vimpc" ]