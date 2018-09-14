FROM alpine:latest as builder
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN    apk --no-cache add \
    ca-certificates

ENV COREDNS_VERSION v1.2.2

RUN set -x \
    && apk --no-cache add \
        go \
        git \
        gcc \
        g++ \
        libc-dev \
        libgcc \
        make \
    && git clone --depth 1 --branch ${COREDNS_VERSION} https://github.com/coredns/coredns /go/src/github.com/coredns/coredns \
    && cd /go/src/github.com/coredns/coredns \
    && make CHECKS="godeps" \
    && mv coredns /usr/bin/coredns \
    && echo "Build complete."

FROM alpine:latest

RUN apk add --no-cache \
    bash \
    tar

COPY --from=builder /usr/bin/coredns /usr/bin/coredns

ENTRYPOINT [ "coredns", "-log" ]