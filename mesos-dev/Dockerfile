FROM debian:sid
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	automake \
	ca-certificates \
	curl \
	g++ \
	libapr1-dev \
	libcurl4-openssl-dev \
	libpython-dev \
	libsasl2-dev \
	libsasl2-modules \
	libsvn-dev \
	libtool \
	linux-base \
	logrotate \
	make \
	maven \
	netcat-traditional \
	openjdk-8-jdk \
	patch \
	python-rbtools \
	unzip \
	zlib1g-dev \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/mesos

ENTRYPOINT [ "bash" ]
