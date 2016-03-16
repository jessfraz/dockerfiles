FROM alpine
MAINTAINER Jessica Frazelle <jess@docker.com>

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

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
	&& apk add $buildDeps \
	&& mkdir -p /go/src/camlistore.googlesource.com \
	&& cd /go/src/camlistore.googlesource.com \
	&& git clone --depth 1 -b 0.9 https://camlistore.googlesource.com/camlistore.git \
	&& cd /go/src/camlistore.googlesource.com/camlistore \
	&& go run make.go \
	&& cp -r ./bin/* /usr/local/bin/ \
	&& apk del $buildDeps \
	&& rm -rf /var/cache/apk/* \
	&& rm -rf /go \
	&& echo "Build complete."


ENTRYPOINT [ "camlistored" ]
