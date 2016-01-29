FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apk update && apk add \
	build-base \
	ca-certificates \
	ruby \
	ruby-dev \
	&& rm -rf /var/cache/apk/* \
	&& gem install --no-document t

ENTRYPOINT [ "t" ]
