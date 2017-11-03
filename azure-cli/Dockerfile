FROM debian:jessie
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apt-get update && apt-get install -y \
	apt-transport-https \
	ca-certificates \
	gnupg \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN apt-key adv --keyserver packages.microsoft.com --recv-keys 52E16F86FEE04B979B07E28DB02C46DF417A0893 \
	&& echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ wheezy main" >> /etc/apt/sources.list.d/azure-cli.list

RUN apt-get update && apt-get install -y \
	azure-cli \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENTRYPOINT	[ "az" ]
