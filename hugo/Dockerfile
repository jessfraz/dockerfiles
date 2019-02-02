FROM golang:1.11-alpine AS builder

ENV CGO_ENABLED=0
ENV GOOS=linux
ENV GO111MODULE=on
ENV HUGO_VERSION v0.54.0

WORKDIR /go/src/github.com/gohugoio/hugo

RUN apk add --no-cache \
    ca-certificates \
    git \
    musl-dev

RUN git clone --depth 1 --branch "${HUGO_VERSION}" https://github.com/gohugoio/hugo.git \
    && cd hugo \
    && go install -ldflags '-s -w'

FROM alpine:edge
COPY --from=builder /go/bin/hugo /usr/local/bin/hugo

RUN apk --no-cache add \
    ca-certificates \
    && addgroup -g 1000 hugo \
    && adduser -u 1000 -G hugo -s /bin/sh -D hugo

USER hugo

ENTRYPOINT [ "hugo" ]
CMD [ "--help" ]
