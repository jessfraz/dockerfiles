FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
    build-essential \
    libssl-dev \
    libperl-dev \
    pkg-config \
    curl \
    --no-install-recommends

ENV HOME /home/user
RUN useradd --create-home --home-dir $HOME user \
    && mkdir -p $HOME/.irssi \
    && chown -R user:user $HOME

# get the source
RUN mkdir $HOME/src && \
    curl -sSL http://znc.in/releases/znc-latest.tar.gz | tar -v -C $HOME/src -xz --strip-components 1 && \
    cd $HOME/src && \
    ./configure && \
    make -j8 && \
    make install && \
    rm -rf $HOME/src

WORKDIR $HOME
USER user

ENTRYPOINT [ "znc" ]
CMD [ "-f" ]
