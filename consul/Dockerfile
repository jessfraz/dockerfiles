FROM progrium/busybox
MAINTAINER Jessica Frazelle <jess@docker.com>

ADD https://jesss.s3.amazonaws.com/binaries/consul/0.4.1/consul /usr/local/bin/consul
ADD https://jesss.s3.amazonaws.com/binaries/curl-unix-socket /usr/local/bin/curl-unix-socket

COPY ./dist/ /usr/src/consul

RUN opkg-install curl \
    && mkdir -p /etc/consul.d/ \
    && chmod +x /usr/local/bin/consul \
    && chmod +x /usr/local/bin/curl-unix-socket

ENTRYPOINT [ "/usr/local/bin/consul" ]
