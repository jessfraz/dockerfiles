FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apk update && apk add \
	ca-certificates \
	curl \
	unzip \
	&& curl -sSL https://circle-artifacts.com/gh/andyshinn/alpine-pkg-glibc/6/artifacts/0/home/ubuntu/alpine-pkg-glibc/packages/x86_64/glibc-2.21-r2.apk -o /tmp/glibc-2.21-r2.apk \
	&& apk add --allow-untrusted /tmp/glibc-2.21-r2.apk \
	&& curl -sSL https://circle-artifacts.com/gh/andyshinn/alpine-pkg-glibc/6/artifacts/0/home/ubuntu/alpine-pkg-glibc/packages/x86_64/glibc-bin-2.21-r2.apk -o /tmp/glibc-bin-2.21-r2.apk \
	&& apk add --allow-untrusted /tmp/glibc-bin-2.21-r2.apk \
	&& rm -rf /tmp/glibc* \
	&& rm -rf /var/cache/apk/*

ENV CONSUL_VERSION 0.5.2

RUN	curl -sSL https://jesss.s3.amazonaws.com/binaries/consul/${CONSUL_VERSION}/consul -o /bin/consul \
	&& curl -sSL https://jesss.s3.amazonaws.com/binaries/curl-unix-socket -o /bin/curl-unix-socket \
	&& curl -sSL  https://jesss.s3.amazonaws.com/binaries/consul-alerts -o /bin/consul-alerts \
	&& mkdir -p /etc/consul.d/ \
	&& chmod +x /bin/consul \
	&& chmod +x /bin/curl-unix-socket \
	&& chmod +x /bin/consul-alerts

ENTRYPOINT [ "/bin/consul-alerts" ]
CMD [ "start" ]
