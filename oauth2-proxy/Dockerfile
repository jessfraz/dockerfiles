FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN	apk --no-cache add \
	ca-certificates

ENV OAUTH2_PROXY_VERSION v2.2

RUN buildDeps=' \
		go \
		git \
		gcc \
		g++ \
		libc-dev \
		libgcc \
	' \
	set -x \
	&& apk --no-cache add --repository https://dl-3.alpinelinux.org/alpine/edge/community $buildDeps \
	&& go get github.com/bitly/oauth2_proxy || true \
	&& cd /go/src/github.com/bitly/oauth2_proxy \
	&& git checkout "${OAUTH2_VERSION}" \
	&& go get -d github.com/bitly/oauth2_proxy || true \
	&& go get gopkg.in/fsnotify/fsnotify.v1 \
	&& mv "${GOPATH}/src/gopkg.in/fsnotify/fsnotify.v1" "${GOPATH}/src/gopkg.in/fsnotify.v1" \
	&& go build \
	&& mv oauth2_proxy /usr/bin/ \
	&& apk del $buildDeps \
	&& rm -rf /go \
	&& echo "Build complete."


ENTRYPOINT [ "oauth2_proxy" ]
