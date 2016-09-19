FROM debian:stretch
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	automake \
	ca-certificates \
	ccache \
	clang-3.8 \
	clang-format-3.8 \
	clang-tidy-3.8 \
	colorgcc \
	curl \
	g++ \
	iptables \
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


ENV DOCKER_BUCKET get.docker.com
ENV DOCKER_VERSION 1.11.0
ENV DOCKER_SHA256 87331b3b75d32d3de5d507db9a19a24dd30ff9b2eb6a5a9bdfaba954da15e16b

RUN set -x \
	&& curl -fSL "https://${DOCKER_BUCKET}/builds/Linux/x86_64/docker-$DOCKER_VERSION.tgz" -o docker.tgz \
	&& echo "${DOCKER_SHA256} *docker.tgz" | sha256sum -c - \
	&& tar -xzvf docker.tgz \
	&& mv docker/* /usr/local/bin/ \
	&& rmdir docker \
	&& rm docker.tgz \
	&& docker -v \
	&& echo "docker daemon -D -s overlay" > $HOME/.bash_history

ENV CCACHE_MAXSIZE=20G CCACHE_CPP2=true CCACHE_HARDLINK=true CCACHE_SLOPPINESS=file_macro,time_macros,include_file_mtime,include_file_ctime,file_stat_matches CC=/usr/bin/clang CXX=/usr/bin/clang++

WORKDIR /usr/src/mesos

ENTRYPOINT [ "bash" ]
