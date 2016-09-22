FROM ruby:2-alpine

RUN	apk add --no-cache \
	ca-certificates \
	git \
	libxml2 \
	libxslt \
	mariadb-dev \
	nodejs \
	tzdata

RUN	set -x \
	&& apk add --no-cache --virtual .build-deps \
	build-base \
	cmake \
	libxml2-dev \
	libxslt-dev \
	&& git clone --depth 1 https://github.com/srcclr/commit-watcher.git /usr/src/commit-watcher \
	&& cd /usr/src/commit-watcher \
	&& bundle config build.nokogiri --use-system-libraries \
	&& bundle install \
	&& apk del .build-deps

WORKDIR /usr/src/commit-watcher

COPY database.yml /usr/src/commit-watcher/config/database.yml
VOLUME /usr/src/commit-watcher

CMD ["./scripts/deploy"]
