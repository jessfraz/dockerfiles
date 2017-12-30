FROM ubuntu:xenial

LABEL maintainer "Colin Nelson <colin@ifdevthentalk.com>"

RUN apt-get update && \
    apt-get install -y\
        apt-transport-https \
        texmaker \
        --no-install-recommends  && \
    rm -rf /var/lib/apt/lists/*

ENV HOME /home/user
RUN useradd --create-home --home-dir $HOME user \
        && chown -R user:user $HOME

WORKDIR $HOME

CMD texmaker
