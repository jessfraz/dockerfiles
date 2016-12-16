FROM debian:sid
MAINTAINER Jessie Frazelle <jess@linux.com>

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

ENV	VAGRANT_VERSION 1.9.1

ADD	https://releases.hashicorp.com/vagrant/${VAGRANT_VERSION}/vagrant_${VAGRANT_VERSION}_x86_64.deb /src/vagrant_${VAGRANT_VERSION}_x86_64.deb

# install vagrant and the libvirt plugin
RUN dpkg -i /src/vagrant_${VAGRANT_VERSION}_x86_64.deb \
	&& vagrant plugin install vagrant-libvirt

ENTRYPOINT [ "vagrant" ]
