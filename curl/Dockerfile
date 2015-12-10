# curl in a container
#
# docker run --rm -it \
# 	jess/curl -sSL https://check.torproject.org/api/ip
#
FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apk update && apk add \
	curl \
	&& rm -rf /var/cache/apk/*

CMD [ "curl" ]
