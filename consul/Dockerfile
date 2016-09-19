# use alpine edge for go 1.6
FROM alpine:edge
MAINTAINER Jessie Frazelle <jess@linux.com>

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go
#ENV GO15VENDOREXPERIMENT 1

RUN	apk --no-cache add \
	ca-certificates \
	curl

ENV CONSUL_VERSION v0.7.0

RUN buildDeps=' \
		bash \
		go \
		git \
		gcc \
		g++ \
		libc-dev \
		libgcc \
		make \
		nodejs \
		ruby \
		ruby-dev \
		zip \
	' \
	set -x \
	&& apk --no-cache add $buildDeps \
	&& go get github.com/Soulou/curl-unix-socket \
	&& mv /go/bin/curl-unix-socket /usr/bin/ \
	&& mkdir -p /go/src/github.com/hashicorp /etc/consul.d \
	&& git clone --branch ${CONSUL_VERSION} https://github.com/hashicorp/consul /go/src/github.com/hashicorp/consul \
	&& cd /go/src/github.com/hashicorp/consul \
	&& XC_ARCH="amd64" XC_OS="linux" make all \
	&& mv bin/consul /usr/bin/ \
	&& cd ui \
	&& gem install bundler io-console --no-ri --no-rdoc \
	&& bundle install \
	&& make dist \
	&& mkdir -p /usr/src/consul \
	&& mv index.html /usr/src/consul \
	&& mv static /usr/src/consul/ \
	&& mv javascripts /usr/src/consul/ \
	&& apk del $buildDeps \
	&& rm -rf /go \
	&& echo "Build complete."


ENTRYPOINT [ "consul" ]
