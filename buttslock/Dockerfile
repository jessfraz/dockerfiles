#
# This container will listen to DBus events to be notified when your
# computer goes to sleep. When such events happen, it will lock the
# screen with a fancy lock.
#
# It needs to be started with a few bind-mounts:
# - /etc/passwd, /etc/shadow (read-only)
# - /var/run/dbus, the X11 socket (typically /tmp/.X11-unix)
# And it also requires the USER and DISPLAY environment variables to be set.
#
FROM alpine:latest

RUN apk --no-cache add \
	i3lock \
	imagemagick \
	py-dbus \
	py-gobject \
	scrot \
	ttf-liberation \
	xkeyboard-config

COPY buttslock.py buttslock.sh lock.png /

CMD ["/buttslock.py"]
