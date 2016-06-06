FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apk --no-cache add \
	build-base \
	ca-certificates \
	ruby \
	ruby-dev \
	&& gem install --no-document io-console t

ENTRYPOINT [ "t" ]
