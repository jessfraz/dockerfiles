FROM golang:latest as builder
LABEL maintainer="Jessica Frazelle <jess@linux.com>"

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN apt-get update && apt-get install -y \
	apt-transport-https \
	ca-certificates \
	curl \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
	&& curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
	&& echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -

RUN apt-get update && apt-get install -y \
	gcc \
	git \
	g++ \
	make \
	nodejs \
	pkgconf \
	python \
	yarn \
	zip \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV VAULT_VERSION v1.4.2

RUN go get github.com/hashicorp/vault || true

WORKDIR /go/src/github.com/hashicorp/vault

RUN git checkout "${VAULT_VERSION}"

RUN XC_ARCH="amd64" XC_OS="linux" XC_OSARCH="linux/amd64" LD_FLAGS=" -extldflags -static " make bootstrap static-dist bin \
	&& mv bin/vault /usr/bin/vault

FROM alpine:latest

COPY --from=builder /usr/bin/vault /usr/bin/vault
COPY --from=builder /etc/ssl/certs/ /etc/ssl/certs

ENTRYPOINT [ "vault" ]
CMD [ "--help" ]
