FROM ubuntu:16.04
MAINTAINER Justin Garrison <justinleegarrison@gmail.com>

RUN apt-get update && apt-get install -y \
	weechat \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV LANG C.UTF-8
ENV HOME /home/user

RUN useradd --create-home --home-dir $HOME user \
	&& mkdir -p $HOME/.weechat \
	&& chown -R user:user $HOME

WORKDIR $HOME
USER user

ENTRYPOINT ["weechat"]
