# Wine docker image base
FROM debian:stretch
MAINTAINER Jessie Frazelle <jess@linux.com>

# install wine
RUN apt-get update && apt-get install -y \
	wine \
	--no-install-recommends && \
	dpkg --add-architecture i386 && \
	apt-get update && \
	apt-get install -y \
	wine32 \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV HOME /root
WORKDIR $HOME
