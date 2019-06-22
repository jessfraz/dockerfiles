FROM openjdk:8-alpine

ENV ZOOKEEPER_VERSION 3.4.14
ENV PATH $PATH:/opt/zookeeper/bin/

# the start files for zookeeper use bash
RUN apk --no-cache add \
	bash

RUN buildDeps=' \
		curl \
	' \
	&& echo "==> Installing dependencies..." \
	&& apk --no-cache add --virtual build-deps $buildDeps \
	&& echo "==> Downloading Zookeeper..." \
	&& mkdir -p /opt \
	&& curl -sSL "http://apache.osuosl.org/zookeeper/zookeeper-${ZOOKEEPER_VERSION}/zookeeper-${ZOOKEEPER_VERSION}.tar.gz" | tar -xzf - -C /opt \
	&& mv /opt/zookeeper-${ZOOKEEPER_VERSION} /opt/zookeeper \
	&& cp /opt/zookeeper/conf/zoo_sample.cfg /opt/zookeeper/conf/zoo.cfg \
	&& apk del build-deps

ENTRYPOINT ["zkServer.sh", "start-foreground"]
