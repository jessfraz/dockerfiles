FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	libxslt1.1 \
	libjpeg62-turbo \
	python-minimal \
	python-pip \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV LANG en_US.UTF-8
ENV HOME /home/mitm
RUN useradd --create-home --home-dir $HOME mitm \
	&& chown -R mitm:mitm $HOME

EXPOSE 8080

RUN buildDeps=' \
		gcc \
		libjpeg-dev \
		libffi-dev \
		libssl-dev \
		libxml2-dev \
		libxslt1-dev \
		python-dev \
		zlib1g-dev \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y ${buildDeps} --no-install-recommends \
	&& pip install mitmproxy \
	&& apt-get purge -y --auto-remove ${buildDeps} \
	&& rm -rf /var/lib/apt/lists/*

USER mitm

ENTRYPOINT [ "mitmproxy" ]
