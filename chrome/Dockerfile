# Base docker image
FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

COPY google-talkplugin_current_amd64.deb /src/google-talkplugin_current_amd64.deb

ADD  https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb /src/google-chrome-stable_current_amd64.deb

# Install Chromium
RUN sed -i.bak 's/jessie main/jessie main contrib non-free/g' /etc/apt/sources.list && \
    mkdir -p /usr/share/icons/hicolor && \
    apt-get update && apt-get install -y \
    ca-certificates \
    gconf-service \
    libappindicator1 \
    libasound2 \
    libcanberra-gtk-module \
    libcurl3 \
    libexif-dev \
    libgconf-2-4 \
    libnspr4 \
    libnss3 \
    libpango1.0-0 \
    libv4l-0 \
    libxss1 \
    libxtst6 \
    wget \
    xdg-utils \
    --no-install-recommends && \
    dpkg -i '/src/google-chrome-stable_current_amd64.deb' && \
    apt-get install -y \
    pepperflashplugin-nonfree \
    --no-install-recommends && \
    dpkg -i '/src/google-talkplugin_current_amd64.deb'

COPY local.conf /etc/fonts/local.conf

# Autorun x11vnc
CMD ["/usr/bin/google-chrome-stable", "--no-sandbox", "--user-data-dir=/data"]
