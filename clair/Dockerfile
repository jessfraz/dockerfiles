FROM alpine:latest

RUN apk --no-cache add \
	ca-certificates

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN buildDeps=' \
		go \
		git \
		gcc \
		g++ \
		libc-dev \
		libgcc \
	' \
	set -x \
	&& apk --no-cache add $buildDeps \
	&& go get github.com/coreos/clair/cmd/clair \
	&& mv /go/bin/clair /usr/bin/clair \
	&& apk del $buildDeps \
	&& rm -rf /go \
	&& echo "Build complete."

ENTRYPOINT [ "clair" ]
