FROM ubuntu:wily

RUN apt-get update -y && apt-get install -y zsh

COPY ./.zshrc /root/.zshrc

RUN chsh -s /usr/bin/zsh

WORKDIR /root
ENTRYPOINT /usr/bin/zsh
