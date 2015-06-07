FROM debian:wheezy
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-key D880C8E4 \
	&& echo 'deb http://download.opensuse.org/repositories/shells:/fish:/release:/2/Debian_7.0/ ./' > /etc/apt/sources.list.d/fish-shell.list \
	&& apt-get update && apt-get install -y \
	fish \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& mkdir -p /root/.config/fish/completions

ENTRYPOINT [ "fish" ]
