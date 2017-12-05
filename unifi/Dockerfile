FROM ubuntu:16.04

# environment settings
ENV DEBIAN_FRONTEND="noninteractive"

# install deps
RUN apt-get update && apt-get install -y \
	ca-certificates \
	dirmngr \
	gnupg \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

# install gosu
ENV GOSU_VERSION 1.10
RUN set -ex; \
	\
	fetchDeps=' \
		wget \
	'; \
	apt-get update; \
	apt-get install -y --no-install-recommends $fetchDeps; \
	rm -rf /var/lib/apt/lists/*; \
	\
	dpkgArch="$(dpkg --print-architecture | awk -F- '{ print $NF }')"; \
	wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch"; \
	wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch.asc"; \
	\
# verify the signature
	export GNUPGHOME="$(mktemp -d)"; \
	gpg --keyserver ha.pool.sks-keyservers.net --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4; \
	gpg --batch --verify /usr/local/bin/gosu.asc /usr/local/bin/gosu; \
	rm -r "$GNUPGHOME" /usr/local/bin/gosu.asc; \
	\
	chmod +x /usr/local/bin/gosu; \
# verify that the binary works
	gosu nobody true; \
	\
	apt-get purge -y --auto-remove $fetchDeps

# add mongo repo
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6 \
	&& echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" >> /etc/apt/sources.list.d/mongo.list


# install packages
RUN apt-get update && apt-get install -y \
	binutils \
	jsvc \
	mongodb-org-server \
	openjdk-8-jre-headless \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

# unifi version
# From: https://www.ubnt.com/download/unifi/
ENV UNIFI_VERSION "5.6.22"

# install unifi
RUN buildDeps=' \
		curl \
	' \
	set -x \
	&& apt-get update && apt-get install -y \
 		$buildDeps \
		--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& curl -o /tmp/unifi.deb -L "http://dl.ubnt.com/unifi/${UNIFI_VERSION}/unifi_sysvinit_all.deb" \
	&& dpkg -i /tmp/unifi.deb \
	&& rm -rf /tmp/unifi.deb \
	&& apt-get purge -y $buildDeps \
	&& echo "Build complete."

WORKDIR /config
EXPOSE 8080 8081 8443 8843 8880

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT [ "entrypoint.sh" ]
CMD ["java", "-Xmx1024M", "-jar", "/usr/lib/unifi/lib/ace.jar", "start"]
