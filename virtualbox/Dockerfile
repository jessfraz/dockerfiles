# Run virtualbox in a container
#
# docker run -d \
# 	-v /tmp/.X11-unix:/tmp/.X11-unix \
#	-e DISPLAY=unix$DISPLAY \
#	--privileged \
#	--name virtualbox \
#	jess/virtualbox
#
# On first run it will throw an error that you need to
# recompile the kernel module with: /etc/init.d/vboxdrv setup
#
# Here is how you get it to work:
# copy the files you need for the module from the container that
# is currently running to your host
#
# first the script:
# 	docker cp virtualbox:/usr/lib/virtualbox/vboxdrv.sh .
#
# then the share
# 	docker cp virtualbox:/usr/share/virtualbox /usr/share
#
# then run the script:
# 	./vboxdrv.sh setup
#
# it will recompile the module, you can then see it in lsmod
#
# then you can remove all the shit you copied
# 	rm -rf /usr/share/virtualbox
# 	rm vboxdrv
#
FROM debian:jessie
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	ca-certificates \
	curl \
	--no-install-recommends && \
	curl -sSL https://www.virtualbox.org/download/oracle_vbox.asc | apt-key add - && \
	echo "deb http://download.virtualbox.org/virtualbox/debian vivid contrib" >> /etc/apt/sources.list.d/virtualbox.list && \
	apt-get update && \
	apt-get install -y \
	virtualbox-5.0 \
	&& apt-get purge -y --auto-remove \
	ca-certificates \
	curl \
	&& rm -rf /var/lib/apt/lists/*

ENTRYPOINT	[ "/usr/bin/virtualbox" ]
