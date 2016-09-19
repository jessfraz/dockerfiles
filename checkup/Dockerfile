FROM alpine:edge
MAINTAINER Jessie Frazelle <jess@linux.com>

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go
ENV GO15VENDOREXPERIMENT 1

RUN	apk update && apk add \
	ca-certificates \
	&& rm -rf /var/cache/apk/*

RUN buildDeps=' \
		go \
		git \
		gcc \
		libc-dev \
		libgcc \
	' \
	set -x \
	&& apk update \
	&& apk add --no-cache $buildDeps \
	&& go get github.com/sourcegraph/checkup/cmd/checkup \
	&& cp /go/bin/checkup /usr/bin/checkup \
	&& apk del $buildDeps \
	&& rm -rf /var/cache/apk/* \
	&& rm -rf /go \
	&& echo "Build complete."


ENTRYPOINT [ "checkup" ]
