FROM alpine:edge
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN	apk --no-cache add \
	ca-certificates

ENV PERKEEP_VERSION 0.10

RUN buildDeps=' \
		go \
		git \
		gcc \
		libc-dev \
		libgcc \
	' \
	set -x \
	&& apk --no-cache add $buildDeps \
	&& mkdir -p /go/src/perkeep.org \
	&& git clone --depth 1 --branch "${PERKEEP_VERSION}" https://camlistore.googlesource.com/camlistore.git /go/src/perkeep.org \
	&& cd /go/src/perkeep.org \
	&& go run make.go \
	&& cp -r /go/bin/* /usr/local/bin/ \
	&& apk del $buildDeps \
	&& rm -rf /go \
	&& echo "Build complete."


ENTRYPOINT [ "perkeepd" ]
