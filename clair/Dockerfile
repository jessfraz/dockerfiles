FROM golang:alpine as builder

RUN apk --no-cache add \
	ca-certificates \
	git

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN go get github.com/coreos/clair/cmd/clair

FROM alpine:latest

RUN apk --no-cache add \
	ca-certificates \
	git \
	rpm \
	xz

COPY --from=builder /go/bin/clair /usr/bin/clair

ENTRYPOINT [ "clair" ]
