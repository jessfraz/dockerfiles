FROM golang:1.12-alpine as builder
MAINTAINER Jessica Frazelle <jess@linux.com>

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN	apk add --no-cache \
	ca-certificates \
	git \
	gcc \
	libc-dev \
	libgcc \
	make

# Get go deps for tests etc.
RUN go get honnef.co/go/tools/cmd/staticcheck \
		golang.org/x/lint/golint \
		github.com/google/go-cmp/cmp

WORKDIR /go/src/k8scan

COPY *.go /go/src/k8scan/

RUN set -x \
	&& go get -d . \
	&& gofmt -s -l . \
	&& go test ./... \
	&& go vet ./... \
	&& golint ./... \
	&& staticcheck ./... \
	&& CGO_ENABLED=0 go build -a -tags netgo -ldflags '-w -extldflags "-static"' -o /usr/bin/k8scan *.go \
	&& echo "Build complete."

FROM r.j3ss.co/masscan

COPY --from=builder /usr/bin/k8scan /usr/bin/k8scan
COPY --from=builder /etc/ssl/certs/ /etc/ssl/certs

ENTRYPOINT [ "k8scan" ]
CMD [ "--help" ]
