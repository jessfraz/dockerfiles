FROM alpine
MAINTAINER Jessica Frazelle <jess@docker.com>

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go
#ENV GO15VENDOREXPERIMENT 1

RUN	apk update && apk add \
	ca-certificates \
	curl \
	&& rm -rf /var/cache/apk/*

ENV VAULT_VERSION v0.5.0

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
	&& apk update \
	&& apk add $buildDeps \
	&& mkdir -p /go/src/github.com/hashicorp \
	&& git clone --branch ${VAULT_VERSION} https://github.com/hashicorp/vault /go/src/github.com/hashicorp/vault \
	&& cd /go/src/github.com/hashicorp/vault \
	&& make bootstrap \
	&& XC_ARCH="amd64" XC_OS="linux" make bin \
	&& mv bin/vault /usr/bin/ \
	&& apk del $buildDeps \
	&& rm -rf /var/cache/apk/* \
	&& rm -rf /go \
	&& echo "Build complete."


ENTRYPOINT [ "vault" ]
