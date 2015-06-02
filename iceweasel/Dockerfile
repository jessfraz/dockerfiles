FROM debian:sid
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN sed -i.bak 's/sid main/sid main contrib/g' /etc/apt/sources.list && \
    apt-get update && apt-get install -y \
    flashplugin-nonfree \
    hicolor-icon-theme \
    iceweasel \
    libgl1-mesa-dri \
    libgl1-mesa-glx \
    --no-install-recommends

COPY local.conf /etc/fonts/local.conf

ENTRYPOINT [ "iceweasel" ]
