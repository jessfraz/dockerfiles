FROM ubuntu:14.10
MAINTAINER Justin Garrison <justinleegarrison@gmail.com>

RUN apt-get update && apt-get install -y \
  weechat \
  && rm -rf /var/lib/apt/lists/*

ENV LANG C.UTF-8
ENV HOME /home/user
RUN useradd --create-home --home-dir $HOME user \
  && mkdir -p $HOME/.weechat \
  && chown -R user:user $HOME

WORKDIR $HOME
VOLUME ["$HOME/.weechat"]
USER user

ENTRYPOINT ["weechat"]

