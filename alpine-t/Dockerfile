FROM alpine:latest

MAINTAINER Daniel Romero <infoslack@gmail.com>

RUN apk update 
RUN apk add ca-certificates ruby-dev build-base && rm -rf /var/cache/apk/*
RUN gem install t

ENTRYPOINT [ "t" ]
