FROM java:8
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	ca-certificates \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

# install bazel
RUN buildDeps=' \
		curl \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& curl -sSL https://bazel.build/bazel-release.pub.gpg | apt-key add - \
	&& echo "deb [arch=amd64] http://storage.googleapis.com/bazel-apt stable jdk1.8" >> /etc/apt/sources.list.d/bazel.list \
	&& apt-get update && apt-get install -y \
	bazel \
	--no-install-recommends \
	&& apt-get purge -y --auto-remove $buildDeps

# install gitiles
RUN buildDeps=' \
		curl \
		git \
		zip \
	' \
	set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& git clone --depth 1 --recurse-submodules https://gerrit.googlesource.com/gitiles /usr/src/gitiles \
	&& ( \
		cd /usr/src/gitiles \
		&& git submodule update --init \
		&& bazel build //... \
	) \
	&& apt-get purge -y --auto-remove $buildDeps

COPY start.sh /usr/bin/start.sh

ENTRYPOINT [ "/usr/bin/start.sh" ]
