FROM alpine:latest
LABEL maintainer "Sid Carter <me@sidcarter.com>"

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go
ENV CFSSL_VERSION 1.2.0

RUN buildDeps=' \
		bash \
		go \
		git \
		gcc \
		libc-dev \
    ' \
    set -x && \
    apk upgrade --update && \
    apk add --no-cache $buildDeps && \
    git clone --branch ${CFSSL_VERSION} https://github.com/cloudflare/cfssl.git $GOPATH/src/github.com/cloudflare/cfssl && \
    go get github.com/cloudflare/cfssl/cmd/... && \
    apk del $buildDeps

CMD ["cfssl"]
