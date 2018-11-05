FROM debian:sid-slim

RUN apt-get update && apt-get install -y \
    apulse \
    dirmngr \
    gnupg \
    ca-certificates \
    hicolor-icon-theme \
    libasound2 \
    libgl1-mesa-dri \
    libgl1-mesa-glx \
    curl \
    bzip2 \
    libgtk-3-0 \
    libdbus-glib-1-2 \
    libxrender1 \
    libx11-xcb-dev \
    libx11-xcb1 \
    libxt6 \
    ffmpeg \
    xz-utils \
    libpulse0 \
    --no-install-recommends \
    && cd /opt/ \
    && curl -fSL -o firefox.tar.bz2 "https://download.mozilla.org/?product=firefox-nightly-latest-ssl&os=linux64&lang=en-US" \
    && tar xvjf firefox.tar.bz2 \
    && rm firefox.tar.bz2 \
    && ln -s /opt/firefox/firefox /usr/local/bin/ \
    && update-alternatives --install /usr/bin/x-www-browser x-www-browser /opt/firefox/firefox 200 \
    && update-alternatives --set x-www-browser /opt/firefox/firefox \
    && rm -rf /var/lib/apt/lists/*

ENV LANG en-US

COPY local.conf /etc/fonts/local.conf
COPY firefox.desktop /usr/share/applications/firefox.desktop

RUN mkdir -p /etc/firefox && \  
    echo 'pref("browser.tabs.remote.autostart", false);' >> /etc/firefox/syspref.js

COPY entrypoint.sh /usr/bin/startfirefox

ENTRYPOINT [ "startfirefox" ]
