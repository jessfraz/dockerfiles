# xjump
#
# docker run -v /tmp/.X11-unix:/tmp/.X11-unix \
# 	-v /dev/snd \
# 	-e DISPLAY=unix:0.0 \
# 	arturn/xjump
#
FROM debian:bullseye-slim
LABEL maintainer "Artur Nebot"

RUN apt-get update && apt-get install -y \
	apt-utils \
	xjump \
	&& rm -rf /var/lib/apt/lists/*

ENV HOME /home/xjump
ENV PATH "/usr/games:${PATH}"
RUN useradd --create-home --home-dir $HOME xjump \
	&& chown -R xjump:xjump $HOME 

WORKDIR $HOME
USER xjump

ENTRYPOINT [ "xjump" ]
