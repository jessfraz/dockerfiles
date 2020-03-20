# Run gtetrinet in a container
#
# xhost +"local:docker@" && \
# docker run -it \
#       -v /tmp/.X11-unix:/tmp/.X11-unix \ # mount the X11 socket
#       -e DISPLAY=$DISPLAY \
#       --name gtetrinet \
#       jessfraz/gtetrinet

FROM debian:stretch-slim
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apt-get update && apt-get install -y \
        dbus \
	gtetrinet \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

COPY dbus.conf /etc/dbus-1/session.d/

# Run gtetrinet as non privileged user
ENV HOME /home/gtetrinet
RUN useradd --create-home --home-dir $HOME gtetrinet \
	&& chown -R gtetrinet:gtetrinet $HOME
USER gtetrinet

# Autorun gtetrinet
ENTRYPOINT ["dbus-run-session", "/usr/games/gtetrinet"]
