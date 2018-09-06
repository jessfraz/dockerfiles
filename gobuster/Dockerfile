FROM golang:1.10-alpine AS builder

RUN	apk --no-cache add \
	ca-certificates \
    git \
    make
    
ENV GOBUSTER_VERSION v2.0.1

RUN mkdir -p /go/src/gobuster \
	&& git clone --depth 1 --branch "${GOBUSTER_VERSION}" https://github.com/OJ/gobuster.git /go/src/gobuster \
	&& cd /go/src/gobuster \
    && go get && go build \
	&& make \
	&& cp -vr /go/bin/* /usr/local/bin/ \
	&& echo "Build complete."

FROM alpine:latest

RUN	apk --no-cache add \
	ca-certificates

COPY --from=builder /usr/local/bin/gobuster /usr/bin/gobuster

ENTRYPOINT [ "gobuster" ]

