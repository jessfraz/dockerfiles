FROM debian:jessie

# Packaged dependencies
RUN apt-get update && apt-get install -y \
	autoconf \
	automake \
	ca-certificates \
	curl \
	g++ \
	git \
	libtool \
	make \
	python \
	python-pip \
	rsync \
	unzip \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN pip install -U \
	argparse

# Install Go
ENV GO_VERSION 1.6.2
RUN curl -fsSL "https://storage.googleapis.com/golang/go${GO_VERSION}.linux-amd64.tar.gz" \
	| tar -xzC /usr/local
ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go:/go/src/k8s.io/kubernetes/Godeps/_workspace

# Install google/protobuf
ENV PROTOBUF_VERSION v3.0.0-beta-2
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
	&& docker -v

ENV DOWNLOAD_ETCD_VERSION 2.3.3
RUN curl -sSL https://github.com/coreos/etcd/releases/download/v${DOWNLOAD_ETCD_VERSION}/etcd-v${DOWNLOAD_ETCD_VERSION}-linux-amd64.tar.gz -o /tmp/etcd.tar.gz \
	&& mkdir -p /tmp/etcd \
	&& ( \
	cd /tmp \
	&& tar -xv --strip-components 1 -f etcd.tar.gz -C /tmp/etcd \
	&& mv /tmp/etcd/etcd* /usr/local/bin \
	) \
	&& rm -rf /tmp/etcd*

RUN go get github.com/golang/protobuf/proto \
	&& go get github.com/golang/protobuf/protoc-gen-go \
	&& go get github.com/golang/lint/golint \
	&& go get github.com/tools/godep

WORKDIR /go/src/k8s.io/kubernetes
