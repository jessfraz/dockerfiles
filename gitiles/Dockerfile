FROM java:8-alpine
MAINTAINER Jessie Frazelle <jess@linux.com>

# install bazel
ENV BAZEL_VERSION 0.4.4
RUN buildDeps=' \
		bash \
		build-base \
		curl \
		gnupg \
		linux-headers \
		zip \
	' \
	set -x \
	&& apk --no-cache add $buildDeps \
	&& curl -sSL "https://github.com/bazelbuild/bazel/releases/download/${BAZEL_VERSION}/bazel-${BAZEL_VERSION}-dist.zip" -o "/tmp/bazel-${BAZEL_VERSION}-dist.zip" \
	&& curl -sSL "https://github.com/bazelbuild/bazel/releases/download/${BAZEL_VERSION}/bazel-${BAZEL_VERSION}-dist.zip.sig" -o "/tmp/bazel-${BAZEL_VERSION}-dist.zip.sig" \
	&& curl -sSL "https://github.com/bazelbuild/bazel/releases/download/${BAZEL_VERSION}/bazel-${BAZEL_VERSION}-dist.zip.sha256" -o "/tmp/bazel-${BAZEL_VERSION}-dist.zip.sha256" \
	&& export GNUPGHOME="$(mktemp -d)" \
	&& curl -sSL "https://bazel.build/bazel-release.pub.gpg" | gpg --no-tty --import \
	&& gpg --batch --verify "/tmp/bazel-${BAZEL_VERSION}-dist.zip.sig" "/tmp/bazel-${BAZEL_VERSION}-dist.zip" \
	&& ( \
		cd /tmp \
		&& cat "bazel-${BAZEL_VERSION}-dist.zip.sha256" | sha256sum -c - \
	) \
	&& rm -r "$GNUPGHOME" "/tmp/bazel-${BAZEL_VERSION}-dist.zip.sig" "/tmp/bazel-${BAZEL_VERSION}-dist.zip.sha256" \
	&& mkdir -p /tmp/bazel \
	&& unzip "/tmp/bazel-${BAZEL_VERSION}-dist.zip" -d /tmp/bazel \
	&& rm "/tmp/bazel-${BAZEL_VERSION}-dist.zip" \
	&& ( \
		cd /tmp/bazel \
		&& unset JAVA_VERSION \
		&& bash ./compile.sh compile \
		&& mv output/bazel /usr/bin/bazel \
	) \
	&& apk del $buildDeps \
	&& rm -rf /tmp/bazel*


# install gitiles
RUN buildDeps=' \
		git \
	' \
	set -x \
	&& apk --no-cache add $buildDeps \
	&& git clone --depth 1 --recurse-submodules https://gerrit.googlesource.com/gitiles /usr/src/gitiles \
	&& ( \
		cd /usr/src/gitiles \
		&& git submodule update --init \
		&& bazel build //... \
	) \
	&& apk del $buildDeps

COPY start.sh /usr/bin/start.sh

ENTRYPOINT [ "/usr/bin/start.sh" ]
