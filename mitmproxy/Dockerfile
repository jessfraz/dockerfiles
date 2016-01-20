FROM ubuntu:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
        python \
        python-dev \
        python-virtualenv 

RUN buildDeps=' \
        libjpeg8-dev \
        libffi-dev \
        libssl-dev \
        libxml2-dev \
        libxslt1-dev \
        zlib1g-dev \
    ' \
    && set -x \
    && apt-get install -y ${buildDeps} --no-install-recommends \
    && useradd -m mitm \
    && su -c "virtualenv /home/mitm/mitmproxy" mitm \
    && su -c "/home/mitm/mitmproxy/bin/pip install Pillow==3.0 mitmproxy" mitm \
    && apt-get purge -y --auto-remove ${buildDeps} build-essential gcc \
    && rm -rf /var/lib/apt/lists/* 

EXPOSE 8080

ENV HOME /home/mitm
ENV LANG en_US.UTF-8

USER mitm
CMD [ "/home/mitm/mitmproxy/bin/python", "/home/mitm/mitmproxy/bin/mitmproxy" ]
