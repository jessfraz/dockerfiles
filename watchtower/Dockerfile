FROM golang:alpine as builder
LABEL maintainer "Jess Frazelle <jess@linux.com>"

RUN apk --no-cache add \
	ca-certificates \
	gcc \
	git \
	libc-dev

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

ENV WATCHTOWER_VERSION v0.3.0

RUN git clone --depth 1 --branch ${WATCHTOWER_VERSION} https://github.com/v2tec/watchtower /go/src/github.com/v2tec/watchtower

RUN go get github.com/Masterminds/glide

WORKDIR /go/src/github.com/v2tec/watchtower

RUN glide install
RUN go build -o /usr/bin/watchtower

FROM alpine:latest
COPY --from=builder /usr/bin/watchtower /usr/bin/watchtower
COPY --from=builder /etc/ssl/certs/ /etc/ssl/certs

ENTRYPOINT [ "watchtower" ]
CMD [ "--help" ]
