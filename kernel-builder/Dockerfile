FROM debian:stretch
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	ca-certificates \
	curl \
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

COPY install_kernel /usr/local/bin/install_kernel

CMD [ "bash" ]
