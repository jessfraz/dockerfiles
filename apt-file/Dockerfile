FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	apt-file \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

CMD [ "bash" ]
