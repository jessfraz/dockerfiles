# Usage:
# docker run --rm -it \
#	--privileged \
#	-v /lib/modules:/lib/modules:ro \
#	-v /usr/src:/usr/src:ro \
#	-v /etc/localtime:/etc/localtime:ro \
#	r.j3ss.co/bcc-tools
#
FROM debian:buster
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && apt-get install -y \
	apt-transport-https \
	ca-certificates \
	dirmngr \
	gnupg \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

# add the iovisor repository
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys D4284CDD
RUN echo "deb [trusted=yes] https://repo.iovisor.org/apt/xenial xenial-nightly main" > /etc/apt/sources.list.d/iovisor.list

RUN apt-get update && apt-get install -y \
	binutils \
	bcc-tools \
	libbcc-examples \
	python-bcc \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV PATH /usr/share/bcc/tools:$PATH

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
