# ab (apache benchmark)
# in a container
#
# docker run --rm -it \
# 	jess/ab
#
FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apk update && apk add \
	apache2-ssl \
	apache2-utils \
	ca-certificates \
	htop \
	&& rm -rf /var/cache/apk/*

ENTRYPOINT [ "ab" ]
