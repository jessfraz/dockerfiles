FROM ubuntu:14.10
MAINTAINER Justin Garrison <justinleegarrison@gmail.com>

RUN apt-get update && apt-get install -y \
  tmux \
  && rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["tmux"]

