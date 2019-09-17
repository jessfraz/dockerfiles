FROM ubuntu:bionic
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

# https://gerrit.googlesource.com/gitiles/
ENV GITILES_VERSION v0.3

RUN apt-get update && apt-get install -y \
	apt-transport-https \
	bash \
	ca-certificates \
	curl \
	git \
	gnupg \
	openjdk-8-jdk \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

# install bazel
RUN set -x \
	&& echo "deb [arch=amd64] https://storage.googleapis.com/bazel-apt stable jdk1.8" | tee /etc/apt/sources.list.d/bazel.list \
	&& curl https://bazel.build/bazel-release.pub.gpg | apt-key add - \
	&& apt-get update && apt-get install -y \
	bazel \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& : install Bazel to build gitiles \
	&& git clone --depth 1 --branch "${GITILES_VERSION}" https://gerrit.googlesource.com/gitiles /usr/src/gitiles \
	&& ( \
		cd /usr/src/gitiles \
		&& bazel build java/com/google/gitiles/dev \
		&& cp -rL bazel-bin bin \
		&& rm -rf bazel-bin \
	) \
	&& : clean up unneeded packages and files \
    && apt purge -y --auto-remove bazel \
	&& rm /etc/apt/sources.list.d/bazel.list

COPY start.sh /usr/bin/start.sh

ENTRYPOINT [ "/usr/bin/start.sh" ]
