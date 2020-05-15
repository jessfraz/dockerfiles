FROM l.gcr.io/google/bazel:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

# https://gerrit.googlesource.com/gitiles/
ENV GITILES_VERSION v0.4

RUN apt-get update && apt-get install -y \
	bash \
	ca-certificates \
	curl \
	git \
	openjdk-8-jdk \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

# install bazel
RUN set -x \
	&& git clone --depth 1 --branch "${GITILES_VERSION}" https://gerrit.googlesource.com/gitiles /usr/src/gitiles \
	&& ( \
		cd /usr/src/gitiles \
		&& bazel build java/com/google/gitiles/dev \
		&& cp -rL bazel-bin bin \
		&& rm -rf bazel-bin \
	)

COPY start.sh /usr/bin/start.sh

ENTRYPOINT [ "/usr/bin/start.sh" ]
