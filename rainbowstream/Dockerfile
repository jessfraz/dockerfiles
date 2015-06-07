FROM python:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	libjpeg-dev \
	libfreetype6 \
	libfreetype6-dev \
	zlib1g-dev \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN pip install rainbowstream

ENTRYPOINT [ "rainbowstream" ]
