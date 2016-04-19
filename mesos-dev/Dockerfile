FROM debian:sid
MAINTAINER Jessica Frazelle <jess@docker.com>

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


RUN curl -sSL https://get.docker.com/builds/Linux/x86_64/docker-latest.tgz | tar -xvz \
		-C /usr/bin --strip-components 1 \
	&& chmod +x /usr/bin/docker* \
	&& echo "docker daemon -D -s overlay" > $HOME/.bash_history

ENV CCACHE_MAXSIZE=20G CCACHE_CPP2=true CCACHE_HARDLINK=true CCACHE_SLOPPINESS=file_macro,time_macros,include_file_mtime,include_file_ctime,file_stat_matches CC=/usr/bin/clang CXX=/usr/bin/clang++

WORKDIR /usr/src/mesos

ENTRYPOINT [ "bash" ]
