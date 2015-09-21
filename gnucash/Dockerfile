# VERSION:		0.1
# DESCRIPTION:	Create gnucash container with its dependencies
# AUTHOR:		Christian Koep <christian.koep@fom-net.de>
# USAGE:
#	# Build gnucash image
#	docker build -t gnucash .
#
#	# Run the container
#	docker run -d \
#		-v /tmp/.X11-unix:/tmp/.X11-unix \
#		-e DISPLAY=$DISPLAY \
#		-v $HOME/.gnucash:/home/gnucash/.gnucash \
#		--name gnucash \
#		-h gnucash \
#		gnucash

FROM debian:jessie
MAINTAINER Christian Koep <christian.koep@fom-net.de>

ENV DEBIAN_FRONTEND noninteractiv

RUN apt-get update && apt-get install -y \
	gnucash \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV HOME /home/gnucash

RUN useradd --create-home --home-dir $HOME gnucash \
	&& chown -R gnucash:gnucash $HOME

WORKDIR $HOME
USER gnucash
ENTRYPOINT ["/usr/bin/gnucash"]
