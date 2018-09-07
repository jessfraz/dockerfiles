FROM golang:1.10-alpine AS builder
RUN apk add --no-cache --upgrade \
    git \
    openssh-client \
    ca-certificates \
    && go get -u github.com/golang/dep/cmd/dep

ENV SUBFINDER_VERSION master

WORKDIR /go/src/subfinder

RUN git clone --depth 1 --branch "${SUBFINDER_VERSION}" https://github.com/subfinder/subfinder.git /go/src/subfinder \
    && cd /go/src/subfinder \
    && dep ensure -vendor-only -v \
    && go build -o /usr/local/bin/subfinder *.go \
    && echo "Build complete."

# Final Container
FROM alpine
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=builder /usr/local/bin/subfinder /usr/local/bin/subfinder

ENTRYPOINT ["/usr/local/bin/subfinder"]
