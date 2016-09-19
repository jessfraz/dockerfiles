FROM alpine:latest
MAINTAINER Jessie Frazelle <jess@linux.com>

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN	apk --no-cache add \
	ca-certificates

ENV CAMLISTORE_VERSION 0.9

RUN buildDeps=' \
		go \
		git \
		gcc \
		libc-dev \
		libgcc \
	' \
	set -x \
	&& apk --no-cache add $buildDeps \
	&& mkdir -p /go/src/camlistore.googlesource.com \
	&& cd /go/src/camlistore.googlesource.com \
	&& git clone --depth 1 -b "${CAMLISTORE_VERSION}" https://camlistore.googlesource.com/camlistore.git \
	&& cd /go/src/camlistore.googlesource.com/camlistore \
	&& go run make.go \
	&& cp -r ./bin/* /usr/local/bin/ \
	&& apk del $buildDeps \
	&& rm -rf /go \
	&& echo "Build complete."


ENTRYPOINT [ "camlistored" ]
