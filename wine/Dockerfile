# Wine docker image base
FROM debian:sid-slim
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

# install wine
RUN echo "deb http://deb.debian.org/debian sid main contrib" > /etc/apt/sources.list \
	&& apt-get update && apt-get install -y \
	apt-transport-https \
	cabextract \
	ca-certificates \
	curl \
	gnupg2 \
	fonts-wine \
	winetricks \
	--no-install-recommends && \
	curl -sSL "https://dl.winehq.org/wine-builds/winehq.key" | apt-key add - \
	&& echo "deb https://dl.winehq.org/wine-builds/debian/ bullseye main" >> /etc/apt/sources.list \
	&& dpkg --add-architecture i386 && \
	apt-get update && \
	apt-get install -y \
	libwine \
	winehq-staging \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV HOME /root
WORKDIR $HOME
