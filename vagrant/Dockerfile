FROM debian:buster
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN	apt-get update && apt-get install -y \
	gcc \
	libxslt-dev \
	libxml2-dev \
	libvirt-dev \
	make \
	pkg-config \
	ruby-dev \
	ruby-fog \
	zlib1g-dev \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV	VAGRANT_VERSION 2.1.2

# download the source
RUN buildDeps=' \
		ca-certificates \
		curl \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& curl -sSL "https://releases.hashicorp.com/vagrant/${VAGRANT_VERSION}/vagrant_${VAGRANT_VERSION}_x86_64.deb" -o /tmp/vagrant-amd64.deb \
	&& dpkg -i /tmp/vagrant-amd64.deb \
	&& rm -rf /tmp/*.deb \
	&& apt-get purge -y --auto-remove $buildDeps

# install  the libvirt plugin
RUN vagrant plugin install vagrant-libvirt

ENTRYPOINT [ "vagrant" ]
