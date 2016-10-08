FROM	ruby:alpine
MAINTAINER	Jessie Frazelle <jess@linux.com>

RUN	apk add --no-cache \
	ca-certificates \
	git

RUN	set -x \
	&& apk add --no-cache --virtual .build-deps \
	build-base \
	&& gem install travis --no-rdoc --no-ri \
	&& apk del .build-deps

ENTRYPOINT	["travis"]
