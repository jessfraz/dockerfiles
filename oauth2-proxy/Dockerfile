FROM golang:alpine as builder
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN	apk --no-cache add \
	ca-certificates \
	git

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

ENV OAUTH2_PROXY_VERSION v2.2

RUN go get github.com/bitly/oauth2_proxy || true \
	&& cd /go/src/github.com/bitly/oauth2_proxy \
	&& git checkout "${OAUTH2_VERSION}" \
	&& go get -d github.com/bitly/oauth2_proxy || true \
	&& go get gopkg.in/fsnotify/fsnotify.v1 \
	&& mv "${GOPATH}/src/gopkg.in/fsnotify/fsnotify.v1" "${GOPATH}/src/gopkg.in/fsnotify.v1" \
	&& go build \
	&& mv oauth2_proxy /usr/bin/


FROM alpine:latest

COPY --from=builder /usr/bin/oauth2_proxy /usr/bin/oauth2_proxy
COPY --from=builder /etc/ssl/certs/ /etc/ssl/certs

ENTRYPOINT [ "oauth2_proxy" ]
