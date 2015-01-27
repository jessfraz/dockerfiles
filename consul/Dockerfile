FROM progrium/busybox
MAINTAINER Jessica Frazelle <jess@docker.com>

ADD https://jesss.s3.amazonaws.com/consul/0.4.1/consul /usr/local/bin/consul

COPY ./dist/ /usr/src/consul

RUN opkg-install curl \
    && mkdir -p /etc/consul.d/ \
    && chmod +x /usr/local/bin/consul

ENTRYPOINT [ "/usr/local/bin/consul" ]
