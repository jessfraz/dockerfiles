FROM debian:jessie

RUN apt-get update -y \
    && apt-get install -y zsh \
    && rm -rf /var/lib/apt/lists/*

COPY ./.zshrc /root/.zshrc
RUN chsh -s /usr/bin/zsh
ENV SHELL /usr/bin/zsh

WORKDIR /root
ENTRYPOINT /usr/bin/zsh
