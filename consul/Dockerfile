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
	&& curl -sSL https://jesss.s3.amazonaws.com/binaries/consul/${CONSUL_VERSION}/ui.zip -o /tmp/ui.zip \
	&& unzip /tmp/ui.zip -d /usr/src/ \
	&& rm -rf /tmp/ui.zip \
	&& mv /usr/src/dist /usr/src/consul \
	&& mkdir -p /etc/consul.d/ \
	&& chmod +x /bin/consul \
	&& chmod +x /bin/curl-unix-socket \
	&& /usr/glibc/usr/bin/ldconfig /lib /usr/glibc/usr/lib

ENTRYPOINT [ "/bin/consul" ]
