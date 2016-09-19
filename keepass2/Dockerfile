# DESCRIPTION:	Create keepass2 container with its dependencies
# AUTHOR:		Christian Koep <christian.koep@fom-net.de>
# USAGE:
#	# Build keepass2 image
#	docker build -t keepass2 .
#
#	# Run the container and mount your keepass2 database file
#	docker run -it \
#		-v /home/$USER/DB.kdbx:/root/DB.kdbx \
#		-v /tmp/.X11-unix:/tmp/.X11-unix \
#		-e DISPLAY=$DISPLAY \
#		keepass2
#
# ISSUES:
#	# 'Gtk: cannot open display: :0'
#	Try to set 'DISPLAY=your_host_ip:0' or run 'xhost +' on your host.
#	(see: http://stackoverflow.com/questions/28392949/running-chromium-inside-docker-gtk-cannot-open-display-0)
#

FROM debian:sid
MAINTAINER Christian Koep <christian.koep@fom-net.de>

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y \
	keepass2 \
	xdotool \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

CMD ["/usr/bin/keepass2"]
