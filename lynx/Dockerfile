# Run Lynx in a conatiner 
#
# docker run --rm -it \
#	--name lynx \
#	jess/lynx github.com/jfrazelle
#
FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	lynx \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENTRYPOINT [ "lynx" ]
