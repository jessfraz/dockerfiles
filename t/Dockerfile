FROM alpine:latest

RUN apk update && apk add \
	ca-certificates \
	ruby-dev \
	build-base \
	&& rm -rf /var/cache/apk/*

RUN gem install t

ENTRYPOINT [ "t" ]
