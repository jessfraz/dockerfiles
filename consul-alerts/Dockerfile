FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

ENV CONSUL_VERSION 0.5.0

ADD https://jesss.s3.amazonaws.com/binaries/consul-alerts /usr/local/bin/consul-alerts
ADD https://jesss.s3.amazonaws.com/binaries/consul/${CONSUL_VERSION}/consul /usr/local/bin/consul
ADD https://jesss.s3.amazonaws.com/binaries/curl-unix-socket /usr/local/bin/curl-unix-socket

RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    --no-install-recommends \
    && mkdir -p /etc/consul.d/ \
    && chmod +x /usr/local/bin/consul \
    && chmod +x /usr/local/bin/curl-unix-socket \
    && chmod +x /usr/local/bin/consul-alerts

ENTRYPOINT [ "/usr/local/bin/consul-alerts", "start" ]
