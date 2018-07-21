FROM ruby:alpine

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
		pkgconfig \
		ruby-json \
	&& git clone --depth 1 https://github.com/srcclr/commit-watcher.git /usr/src/commit-watcher \
	&& ( \
		cd /usr/src/commit-watcher \
		&& gem install \
			activesupport-json_encoder \
			--no-rdoc --no-ri \
		&& bundle config build.nokogiri --use-system-libraries \
		&& bundle update sdoc \
		&& bundle install \
	) \
	&& apk del .build-deps

WORKDIR /usr/src/commit-watcher

COPY database.yml /usr/src/commit-watcher/config/database.yml
VOLUME /usr/src/commit-watcher

CMD ["./scripts/deploy"]
