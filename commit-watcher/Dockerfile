FROM mhart/alpine-node:5

RUN	apk add --no-cache \
	ca-certificates \
	libxml2 \
	libxslt \
	mariadb-dev \
	ruby \
	ruby-bigdecimal

RUN	set -x \
	&& apk add --no-cache --virtual .build-deps \
	build-base \
	cmake \
	git \
	libxml2-dev \
	libxslt-dev \
	ruby-dev \
	&& git clone --depth 1 https://github.com/srcclr/commit-watcher.git /usr/src/commit-watcher \
	&& cd /usr/src/commit-watcher \
	&& gem install bundler io-console tzinfo tzinfo-data --no-rdoc --no-ri \
	&& bundle config build.nokogiri --use-system-libraries \
	&& bundle install \
	&& apk del .build-deps

WORKDIR /usr/src/commit-watcher

COPY database.yml /usr/src/commit-watcher/config/database.yml

CMD ["./scripts/deploy"]
