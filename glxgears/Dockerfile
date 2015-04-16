# To use:
#   docker run -v /tmp/.X11-unix:/tmp/.X11-unix -e DISPLAY=unix$DISPLAY --device /dev/dri jess/glxgears
# Base docker image
FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

# Install all the things
RUN sed -i.bak 's/jessie main/jessie main contrib non-free/g' /etc/apt/sources.list && \
    apt-get update && apt-get install -y \
    glx-alternative-nvidia \
    libgl1-mesa-glx \
    libgl1-mesa-dri \
    mesa-utils \
    --no-install-recommends

ENV LIBGL_DEBUG verbose

ENTRYPOINT [ "glxgears" ]
