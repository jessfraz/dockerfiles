# Base docker image
FROM jess/virtualbox:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

ENV	VERSION 1.7.4

ADD	https://dl.bintray.com/mitchellh/vagrant/vagrant_${VERSION}_x86_64.deb /src/vagrant_${VERSION}_x86_64.deb 

# Install Vagrant
RUN	apt-get update \
	&& dpkg -i /src/vagrant_${VERSION}_x86_64.deb \
	&& rm -rf /var/lib/apt/lists/*

ENTRYPOINT [ "vagrant" ]
