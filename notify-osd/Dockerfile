# To use:
# Needs X11 socket and dbus mounted
#
# docker run -d \
#	-v /etc/machine-id:/etc/machine-id:ro \
#	-v /etc/localtime:/etc/localtime:ro \
#	-v /tmp/.X11-unix:/tmp/.X11-unix \
#	-v /var/run/dbus:/var/run/dbus \
#	-v /var/run/user/$(id -u):/var/run/user/$(id -u) \
#	$(env | cut -d= -f1 | awk '{print "-e", $1}') \
#	-e DISPLAY=unix$DISPLAY \
#	-e DBUS_SESSION_BUS_ADDRESS="unix:path=/var/run/user/1000/bus" \
#	-v /etc/passwd:/etc/passwd:ro \
#	-v /etc/group:/etc/group:ro \
#	-u $(whoami) -w "$HOME" \
#	-v /home/jessie/.Xauthority:/home/jessie/.Xauthority \
#	--name notify-osd \
#	jess/notify-osd

FROM debian:stretch
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	at-spi2-core \
	dbus \
	dbus-x11 \
	libgl1-mesa-dri \
	libgl1-mesa-glx \
	libnotify-bin \
	notify-osd \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV HOME /home/user
RUN useradd --create-home --home-dir $HOME user \
	&& mkdir -p $HOME/.cache/dconf \
	&& mkdir -p $HOME/.dbus \
	&& chown -R user:user $HOME

COPY org.freedesktop.Notifications.service /usr/share/dbus-1/services/org.freedesktop.Notifications.service

WORKDIR $HOME

USER user
ENTRYPOINT ["/usr/lib/x86_64-linux-gnu/notify-osd"]
