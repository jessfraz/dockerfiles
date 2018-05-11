FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

ENV JAVA_HOME /usr/lib/jvm/java-1.8-openjdk

RUN apk add --no-cache \
	bash \
	ca-certificates \
	openjdk8

# https://github.com/bazelbuild/bazel/releases
ENV BAZEL_VERSION 0.12.0
# https://gerrit.googlesource.com/gitiles/
ENV GITILES_VERSION v0.2-1

# install bazel
RUN set -x \
	&& apk add --no-cache --virtual=.build-deps \
		build-base \
		curl \
		git \
		linux-headers \
		python \
		zip \
	&& : install Bazel to build gitiles \
    && curl -sSL "https://github.com/bazelbuild/bazel/releases/download/${BAZEL_VERSION}/bazel-${BAZEL_VERSION}-dist.zip" -o /tmp/bazel.zip \
    && mkdir "/tmp/bazel-${BAZEL_VERSION}" \
    && unzip -qd "/tmp/bazel-${BAZEL_VERSION}" /tmp/bazel.zip \
	&& rm -rf /tmp/bazel.zip \
	&& ( \
    	cd "/tmp/bazel-${BAZEL_VERSION}" \
    	&& : add -fpermissive compiler option to avoid compilation failure \
    	&& sed -i -e '/"-std=c++0x"/{h;s//"-fpermissive"/;x;G}' tools/cpp/cc_configure.bzl \
    	&& : add '#include <sys/stat.h>' to avoid mode_t type error \
    	&& sed -i -e '/#endif  \/\/ COMPILER_MSVC/{h;s//#else/;G;s//#include <sys\/stat.h>/;G;}' third_party/ijar/common.h \
    	&& bash compile.sh \
    	&& cp -p output/bazel /usr/bin/ \
	) \
	&& git clone --depth 1 --branch "${GITILES_VERSION}" https://gerrit.googlesource.com/gitiles /usr/src/gitiles \
	&& ( \
		cd /usr/src/gitiles \
		&& bazel build --incompatible_disallow_uncalled_set_constructor=false gitiles-dev:dev \
		&& cp -rL bazel-bin bin \
		&& rm -rf bazel-bin \
	) \
	&& : clean up unneeded packages and files \
    && apk del .build-deps \
	&& rm -rf /usr/bin/bazel /tmp/* /root/.cache "/tmp/bazel-${BAZEL_VERSION}"

COPY start.sh /usr/bin/start.sh

ENTRYPOINT [ "/usr/bin/start.sh" ]
