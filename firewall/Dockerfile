FROM golang:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN go get github.com/Sirupsen/logrus
RUN go get github.com/coreos/go-etcd/etcd && \
    cd /go/src/github.com/coreos/go-etcd && \
    git checkout 6654a8c3055c6154c3f9dfd78c852ada46a2bed0 && \
    go install github.com/coreos/go-etcd/etcd

ADD ./main.go /src/main.go

WORKDIR /src
RUN go build -o firewall main.go

RUN ls
