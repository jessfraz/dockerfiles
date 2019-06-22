FROM alpine:latest as builder
MAINTAINER Jessica Frazelle <jess@linux.com>

RUN	apk add --no-cache \
	ca-certificates \
	curl \
	gzip

ENV NOW_VERSION 15.3.0

RUN curl -sSL -o "/tmp/now.gz" "https://github.com/zeit/now-cli/releases/download/${NOW_VERSION}/now-alpine.gz" \
	&& gzip -dv "/tmp/now.gz" \
	&& mv /tmp/now /usr/bin/now \
	&& chmod +x /usr/bin/now \
	&& rm -rf "/tmp/now.gz"

FROM alpine:latest

RUN apk add --no-cache \
	libstdc++

COPY --from=builder /usr/bin/now /usr/bin/now
COPY --from=builder /etc/ssl/certs/ /etc/ssl/certs

ENTRYPOINT [ "now" ]
