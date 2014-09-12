FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
    build-essential \
    libssl-dev \
    libperl-dev \
    pkg-config \
    curl \
    --no-install-recommends

# get the source
RUN mkdir /znc-tmp
RUN curl -sSL http://znc.in/releases/znc-latest.tar.gz | tar -v -C /znc-tmp -xz
RUN mv /znc-tmp/znc* /znc; rm -rf /znc-tmp

# install it
RUN cd /znc; ./configure; make; make install

# make basic config
# RUN znc --makeconf

# add local config
# ADD conf /.znc

# CMD [ "znc", "-f", "-r" ]