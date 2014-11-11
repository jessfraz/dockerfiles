FROM golang:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN go get github.com/Sirupsen/logrus
RUN go get github.com/coreos/go-etcd/etcd

ADD ./main.go /src/main.go

WORKDIR /src
RUN go build -o firewall main.go

RUN ls
