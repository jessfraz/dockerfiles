FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apk update && apk add \
	ca-certificates \
	curl \
	&& curl -sSL https://circle-artifacts.com/gh/andyshinn/alpine-pkg-glibc/6/artifacts/0/home/ubuntu/alpine-pkg-glibc/packages/x86_64/glibc-2.21-r2.apk -o /tmp/glibc-2.21-r2.apk \
	&& apk add --allow-untrusted /tmp/glibc-2.21-r2.apk \
	&& curl -sSL https://circle-artifacts.com/gh/andyshinn/alpine-pkg-glibc/6/artifacts/0/home/ubuntu/alpine-pkg-glibc/packages/x86_64/glibc-bin-2.21-r2.apk -o /tmp/glibc-bin-2.21-r2.apk \
	&& apk add --allow-untrusted /tmp/glibc-bin-2.21-r2.apk \
	&& rm -rf /tmp/glibc* \
	&& rm -rf /var/cache/apk/*

RUN	curl -sSL https://jesss.s3.amazonaws.com/binaries/vault -o /bin/vault \
	&& chmod +x /bin/vault

ENTRYPOINT [ "/bin/vault" ]
