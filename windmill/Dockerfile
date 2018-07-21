FROM ruby:alpine

RUN	apk add --no-cache \
	bash \
	ca-certificates \
	libxml2 \
	libxslt \
	postgresql-libs \
	sqlite-libs

RUN	set -x \
	&& apk add --no-cache --virtual .build-deps \
		build-base \
		git \
		libxml2-dev \
		libxslt-dev \
		pkgconfig \
		postgresql-dev \
		sqlite-dev \
	&& git clone --depth 1 https://github.com/heroku/windmill.git /usr/src/windmill \
	&& ( \
		cd /usr/src/windmill \
		&& sed -i 's/ruby "2.2.3"/ruby "2.5.1"/' Gemfile \
		&& bundle config build.nokogiri --use-system-libraries \
		&& bundle install \
	) \
	&& apk del .build-deps

WORKDIR /usr/src/windmill

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT [ "entrypoint.sh" ]
CMD [ "puma", "-C", "puma.rb" ]
