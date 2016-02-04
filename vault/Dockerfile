FROM alpine
MAINTAINER Jessica Frazelle <jess@docker.com>

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN	apk update && apk add \
	ca-certificates \
	curl \
	&& rm -rf /var/cache/apk/*

ENV VAULT_VERSION v0.4.1

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
	&& make bin \
	&& mv bin/vault /usr/bin/ \
	&& apk del $buildDeps \
	&& rm -rf /var/cache/apk/* \
	&& rm -rf /go \
	&& echo "Build complete."


ENTRYPOINT [ "vault" ]
