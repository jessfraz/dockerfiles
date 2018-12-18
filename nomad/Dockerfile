FROM golang:1.10-alpine as builder
MAINTAINER Jessica Frazelle <jess@linux.com>

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN	apk add --no-cache \
	bash \
	ca-certificates \
	gcc \
	git \
	libgcc \
	linux-headers \
	make \
	musl-dev \
	npm \
	pkgconf \
	python2 \
	yarn \
	zip

ENV NOMAD_VERSION v0.8.7-rc1

RUN go get github.com/hashicorp/nomad

WORKDIR /go/src/github.com/hashicorp/nomad

RUN git checkout "${NOMAD_VERSION}"

RUN set -x \
	&& make bootstrap ember-dist static-assets \
	&& CGO_ENABLED=1 GOOS=linux GOARCH=amd64 \
		go build \
		-ldflags "-X github.com/hashicorp/nomad/version.GitCommit=$(git rev-parse HEAD) -extldflags -static " \
		-tags "ui release" \
		-o /usr/bin/nomad

FROM alpine:latest

COPY --from=builder /usr/bin/nomad /usr/bin/nomad
COPY --from=builder /etc/ssl/certs/ /etc/ssl/certs

ENTRYPOINT [ "nomad" ]
CMD [ "--help" ]
