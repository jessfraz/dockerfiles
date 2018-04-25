FROM debian:buster
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN dpkg --add-architecture arm64 \
	&& dpkg --add-architecture ppc64el \
	&& apt-get update && apt-get install -y \
	bison \
	ca-certificates \
	curl \
	flex \
	gnupg \
	crossbuild-essential-arm64 \
	crossbuild-essential-ppc64el \
	gcc \
	gcc-7-plugin-dev \
	git \
	kernel-package \
	libelf-dev \
	make \
	libncurses5-dev \
	libssl-dev \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV HOME /root
WORKDIR $HOME

ENV JOBS 4

COPY build_kernel /usr/local/bin/build_kernel

CMD [ "bash" ]
