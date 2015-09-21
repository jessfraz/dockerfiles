FROM alpine
MAINTAINER Daniel Romero <infoslack@gmail.com>

ENV VERSION 0.7.2
RUN apk add --update \
  curl \
  python-dev \
  build-base

RUN curl -LOk "http://dag.wieers.com/home-made/dstat/dstat-${VERSION}.tar.bz2"
RUN tar -xvjf dstat-${VERSION}.tar.bz2

WORKDIR dstat-${VERSION}
RUN make install
RUN apk del --purge curl build-base \
  && rm -rf /var/cache/apk/*

ENTRYPOINT [ "/usr/bin/dstat" ]
