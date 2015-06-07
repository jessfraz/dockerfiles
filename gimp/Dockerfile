# Run gimp in a contianer
#
# docker run -d \
#	-v /etc/localtime:/etc/localtime:ro \
#	-v /tmp/.X11-unix:/tmp/.X11-unix \
#	-e DISPLAY=unix$DISPLAY \
#	-v $HOME/Pictures:/root/Pictures \
#	--name gimp \
#	jess/gimp
#
FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	gimp \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENTRYPOINT [ "gimp" ]
