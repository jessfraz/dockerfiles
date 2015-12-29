FROM alpine
MAINTAINER Jessica Frazelle <jess@docker.com>

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN	apk update && apk add \
	ca-certificates \
	curl \
	&& rm -rf /var/cache/apk/*

ENV CONSUL_VERSION v0.6.0

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
	&& apk update \
	&& apk add $buildDeps \
	&& go get github.com/Soulou/curl-unix-socket \
	&& mv /go/bin/curl-unix-socket /usr/bin/ \
	&& mkdir -p /go/src/github.com/hashicorp /etc/consul.d \
	&& git clone --branch ${CONSUL_VERSION} https://github.com/hashicorp/consul /go/src/github.com/hashicorp/consul \
	&& cd /go/src/github.com/hashicorp/consul \
	&& make all \
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
	&& rm -rf /var/cache/apk/* \
	&& rm -rf /go \
	&& echo "Build complete."


ENTRYPOINT [ "consul" ]
