FROM alpine:latest
MAINTAINER Christian Koep <christian.koep@fom-net.de>

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

ENV MICRO_VERSION v1.1.0

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
	&& git clone --branch "$MICRO_VERSION" https://github.com/zyedidia/micro /go/src/github.com/zyedidia/micro \
	&& cd /go/src/github.com/zyedidia/micro \
	&& mkdir -p /go/bin \
	&& make install \
	&& mv /go/bin/micro /usr/bin/micro \
	&& rm -rf /go/src/github.com/zyedidia/micro \
	&& apk del $buildDeps \
	&& rm -rf /go \
	&& echo "Build complete."

ENTRYPOINT [ "micro" ]
