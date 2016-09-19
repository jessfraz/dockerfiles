# use alpine edge for go 1.6
FROM alpine:edge
MAINTAINER Jessie Frazelle <jess@linux.com>

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN	apk --no-cache add \
	ca-certificates \
	curl

ENV VAULT_VERSION v0.6.1

RUN buildDeps=' \
		bash \
		go \
		git \
		gcc \
		g++ \
		libc-dev \
		libgcc \
		make \
		zip \
	' \
	set -x \
	&& apk --no-cache add $buildDeps \
	&& mkdir -p /go/src/github.com/hashicorp \
	&& git clone --branch ${VAULT_VERSION} https://github.com/hashicorp/vault /go/src/github.com/hashicorp/vault \
	&& cd /go/src/github.com/hashicorp/vault \
	&& go get github.com/mitchellh/gox \
	&& XC_ARCH="amd64" XC_OS="linux" XC_OSARCH="linux/amd64" make bin \
	&& mv bin/vault /usr/bin/ \
	&& apk del $buildDeps \
	&& rm -rf /go \
	&& echo "Build complete."


ENTRYPOINT [ "vault" ]
