FROM alpine:latest
MAINTAINER Airton Zanon <airtonzanon@gmail.com>

RUN apk --no-cache add \
	--repository http://dl-3.alpinelinux.org/alpine/edge/testing/ \
	whois

ENTRYPOINT [ "whois" ]
