FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
    build-essential \
    libssl-dev \
    libperl-dev \
    pkg-config \
    curl \
    sudo \
    --no-install-recommends

# get the source
RUN mkdir /znc-tmp
RUN curl -sSL http://znc.in/releases/znc-latest.tar.gz | tar -v -C /znc-tmp -xz
RUN mv /znc-tmp/znc* /znc; rm -rf /znc-tmp

# install it
RUN cd /znc; ./configure; make -j8; make install
RUN rm -rf /znc
RUN mkdir /znc
ADD znc-shim /usr/local/bin/znc-shim

RUN adduser \
    --system \
    --home=/znc \
    --shell=/bin/sh \
    --no-create-home \
    --group \
    znc

WORKDIR /znc
ENTRYPOINT ["/usr/local/bin/znc-shim"]

# make basic config
# RUN znc --makeconf

# add local config
# ADD conf /.znc

# CMD [ "znc", "-f", "-r" ]
