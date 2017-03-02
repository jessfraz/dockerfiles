FROM debian:stretch
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	ca-certificates \
	curl \
	distcc \
	git \
	kernel-package \
	make \
	libncurses5-dev \
	libssl-dev \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV HOME /root
WORKDIR $HOME

ENV JOBS 4

COPY distccd-init /usr/local/bin/distccd-init

CMD [ "distccd-init", "start" ]
