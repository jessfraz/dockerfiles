FROM java:8-alpine
MAINTAINER Jessie Frazelle <jess@linux.com>

# install buck
RUN buildDeps=' \
		apache-ant \
		bash \
		curl \
		git \
		perl \
		python \
		zip \
	' \
	set -x \
	&& apk --no-cache add $buildDeps \
	--repository http://dl-3.alpinelinux.org/alpine/edge/community/ \
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
	&& rm -rf /buck

COPY start.sh /start.sh

ENTRYPOINT [ "/start.sh" ]
