FROM python:latest
MAINTAINER Justin Garrison <justinleegarrison@gmail.com>

RUN apt-get update && apt-get install -y \
	mplayer mpv \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN pip install mps-youtube

ENTRYPOINT ["mpsyt"]
