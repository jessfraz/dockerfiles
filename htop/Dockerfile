# htop in a container
#
# docker run --rm -it \
# 	--pid host \
# 	jess/htop
#
FROM debian:sid
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	htop \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

CMD [ "htop" ]
