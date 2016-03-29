FROM debian:sid
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	automake \
	g++ \
	libapr1-dev \
	libpython-dev \
	libsasl2-dev \
	libsasl2-modules \
	libsvn-dev \
	libtool \
	make \
	maven \
	openjdk-8-jdk \
	patch \
	zlib1g-dev \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENTRYPOINT [ "bash" ]
