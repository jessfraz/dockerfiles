FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    fakeroot \
    kernel-package \
    libncurses5-dev \
    --no-install-recommends

WORKDIR /usr/src

COPY ./download-kernel /usr/local/bin/download-kernel

CMD [ "bash" ]
