# Wine docker image base
FROM debian:sid-slim
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

# install wine
RUN echo "deb http://deb.debian.org/debian sid main contrib" > /etc/apt/sources.list \
	&& apt-get update && apt-get install -y \
	cabextract \
	ca-certificates \
	fonts-wine \
	wine \
	winetricks \
	--no-install-recommends && \
	dpkg --add-architecture i386 && \
	apt-get update && \
	apt-get install -y \
	libwine \
	wine32 \
	wine64 \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV HOME /root
WORKDIR $HOME
