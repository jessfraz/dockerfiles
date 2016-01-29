# Practical Music Search, an MPD client
#
# docker run --rm -it \
# 	-v /etc/localtime:/etc/localtime:ro \
#	--link mpd:mpd \
#	jess/pms
#
FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	pms \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENTRYPOINT [ "pms" ]
