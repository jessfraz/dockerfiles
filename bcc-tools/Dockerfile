# Usage:
# docker run --rm -it \
#	--privileged \
#	-v /lib/modules:/lib/modules:ro \
#	-v /usr/src:/usr/src:ro \
#	-v /etc/localtime:/etc/localtime:ro \
#	r.j3ss.co/bcc-tools
#
FROM debian:buster-slim
MAINTAINER Jessica Frazelle <jess@linux.com>

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

# Add non-free apt sources
RUN sed -i "s#deb http://deb.debian.org/debian buster main#deb http://deb.debian.org/debian buster main contrib non-free#g" /etc/apt/sources.list

RUN apt-get update && apt-get install -y \
    ca-certificates \
	clang \
	curl \
	gcc \
	git \
	g++ \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies for libbcc
# FROM: https://github.com/iovisor/bcc/blob/master/INSTALL.md#install-build-dependencies
RUN apt-get update && apt-get install -y \
	debhelper \
	cmake \
	libllvm3.9 \
	llvm-dev \
	libclang-dev \
	libelf-dev \
	bison \
	flex \
	libedit-dev \
	clang-format \
	python \
	python-netaddr \
	python-pyroute2 \
	luajit \
	libluajit-5.1-dev \
	arping \
	iperf \
	netperf \
	ethtool \
	devscripts \
	zlib1g-dev \
	libfl-dev \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Build libbcc
ENV BCC_VERSION v0.7.0
RUN git clone --depth 1 --branch "$BCC_VERSION" https://github.com/iovisor/bcc.git /usr/src/bcc
WORKDIR /usr/src/bcc
RUN mkdir build \
	&& cd build \
	&& cmake .. -DCMAKE_INSTALL_PREFIX=/usr \
	&& make \
	&& make install

# Install Go
ENV GO_VERSION 1.11
RUN curl -fsSL "https://golang.org/dl/go${GO_VERSION}.linux-amd64.tar.gz" \
	| tar -xzC /usr/local

# Install google/protobuf
ENV PROTOBUF_VERSION v3.6.1
RUN set -x \
	&& export PROTOBUF_PATH="$(mktemp -d)" \
	&& curl -fsSL "https://github.com/google/protobuf/archive/${PROTOBUF_VERSION}.tar.gz" \
		| tar -xzC "$PROTOBUF_PATH" --strip-components=1 \
	&& ( \
		cd "$PROTOBUF_PATH" \
		&& ./autogen.sh \
		&& ./configure --prefix=/usr/local \
		&& make \
		&& make install \
		&& ldconfig \
	) \
	&& rm -rf "$PROTOBUFPATH"

ENV PATH /usr/share/bcc/tools:$PATH

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
