FROM alpine:latest as builder

RUN apk --no-cache add \
	bzr \
	ca-certificates \
	git \
	rpm \
	xz

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN buildDeps=' \
		go \
		gcc \
		g++ \
		libc-dev \
		libgcc \
	' \
	set -x \
	&& apk --no-cache add $buildDeps \
	&& go get github.com/coreos/clair/cmd/clair \
	&& echo "Build complete."

FROM alpine:latest
COPY --from=builder /go/bin/clair /usr/bin/clair
ENTRYPOINT [ "clair" ]
