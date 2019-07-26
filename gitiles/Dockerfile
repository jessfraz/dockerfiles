FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

ENV JAVA_HOME /usr/lib/jvm/java-1.8-openjdk

RUN apk add --no-cache \
	bash \
	ca-certificates

# https://github.com/bazelbuild/bazel/releases
ENV BAZEL_VERSION 0.28.1
# https://gerrit.googlesource.com/gitiles/
ENV GITILES_VERSION v0.3-1
ENV JAVA_HOME /usr/lib/jvm/default-jvm

# install bazel
RUN set -x \
	&& apk add --no-cache --virtual=.build-deps \
		build-base \
		curl \
		git \
		linux-headers \
		openjdk11 \
		python3 \
		zip \
	&& ln -snf $(which python3) /usr/bin/python \
	&& : install Bazel to build gitiles \
    && curl -sSL "https://github.com/bazelbuild/bazel/releases/download/${BAZEL_VERSION}/bazel-${BAZEL_VERSION}-dist.zip" -o /tmp/bazel.zip \
    && mkdir "/tmp/bazel-${BAZEL_VERSION}" \
    && unzip -qd "/tmp/bazel-${BAZEL_VERSION}" /tmp/bazel.zip \
	&& rm -rf /tmp/bazel.zip \
	&& ( \
    	cd "/tmp/bazel-${BAZEL_VERSION}" \
    	&& bash compile.sh \
    	&& cp -p output/bazel /usr/bin/ \
	)

RUN git clone --depth 1 --branch "${GITILES_VERSION}" https://gerrit.googlesource.com/gitiles /usr/src/gitiles \
	&& ( \
		cd /usr/src/gitiles \
		&& bazel build --incompatible_depset_is_not_iterable=false --sandbox_debug //:gitiles \
		&& cp -rL bazel-bin bin \
		&& rm -rf bazel-bin \
	) \
	&& : clean up unneeded packages and files \
    && apk del .build-deps \
	&& rm -rf /usr/bin/bazel /tmp/* /root/.cache "/tmp/bazel-${BAZEL_VERSION}"

COPY start.sh /usr/bin/start.sh

ENTRYPOINT [ "/usr/bin/start.sh" ]
