FROM java:8-alpine
MAINTAINER Jessica Frazelle <jess@docker.com>

# install buck
RUN buildDeps=' \
		apache-ant \
		bash \
		git \
		perl \
		python \
		zip \
	' \
	set -x \
	&& apk --update add $buildDeps \
	--update-cache --repository http://dl-3.alpinelinux.org/alpine/edge/testing/ \
	&& git clone --depth 1 https://github.com/facebook/buck.git /buck \
	&& ( \
		cd /buck \
		&& ant \
		&& ln -snfv ${PWD}/bin/buck /usr/bin/buck \
	) \
	&& git clone  --depth 1 --recurse-submodules https://gerrit.googlesource.com/gitiles /gitiles \
	&& ( \
		cd /gitiles \
		&& touch .nobuckcheck \
		&& git submodule update --init \
		&& buck build gitiles-dev:dev \
	) \
	&& apk del $buildDeps \
	&& rm -rf /buck \
	&& rm -rf /var/cache/apk/*

COPY start.sh /start.sh

ENTRYPOINT [ "/start.sh" ]
