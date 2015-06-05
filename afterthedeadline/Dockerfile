FROM debian:wheezy
MAINTAINER Jessica Frazelle <jess@docker.com>

EXPOSE 1049

RUN apt-get update && apt-get install -y \
	ca-certificates \
	curl \
	openjdk-6-jre \
	--no-install-recommends \ 
	&& rm -rf /var/lib/apt/lists/*

ENV LANG C.UTF-8

RUN curl -sSL "http://www.polishmywriting.com/download/atd_distribution081310.tgz" -o /tmp/atd.tar.gz \
	&& mkdir -p /usr/src/atd \
	&& tar -xzf /tmp/atd.tar.gz -C /usr/src/atd --strip-components 1 \
	&& rm /tmp/atd.tar.gz* 

WORKDIR /usr/src/atd

ENTRYPOINT [ "sh", "-c", "/usr/src/atd/run.sh" ]
