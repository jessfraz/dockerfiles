FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN	apk --no-cache add \
	ca-certificates

ENV COREDNS_VERSION v1.2.0

RUN buildDeps=' \
		go \
		git \
		gcc \
		g++ \
		libc-dev \
		libgcc \
		make \
	' \
	set -x \
	&& apk --no-cache add $buildDeps \
	&& git clone --depth 1 --branch ${COREDNS_VERSION} https://github.com/coredns/coredns /go/src/github.com/coredns/coredns \
	&& cd /go/src/github.com/coredns/coredns \
	&& make CHECKS="godeps" \
	&& mv coredns /usr/bin/coredns \
	&& apk del $buildDeps \
	&& rm -rf /go \
	&& echo "Build complete."


ENTRYPOINT [ "coredns", "-log" ]
