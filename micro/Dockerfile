FROM alpine:edge
MAINTAINER Christian Koep <christian.koep@fom-net.de>

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

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
	&& git clone --depth 1 -b master https://github.com/zyedidia/micro /usr/src/micro \
	&& cd /usr/src/micro \
	&& mkdir -p /go/bin \
	&& make install \
	&& mv /go/bin/micro /usr/bin/micro \
	&& rm -rf /usr/src/micro \
	&& apk del $buildDeps \
	&& rm -rf /go \
	&& echo "Build complete."

ENTRYPOINT [ "micro" ]
