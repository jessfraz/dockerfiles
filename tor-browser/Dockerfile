FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    libasound2 \
    libdbus-glib-1-2 \
    libgtk2.0-0 \
    libxrender1 \
    libxt6 \
    xz-utils \
    && rm -rf /var/lib/apt/lists/*

ENV HOME /home/user
RUN useradd --create-home --home-dir $HOME user \
    && chown -R user:user $HOME

ENV LANG C.UTF-8

ENV TOR_VERSION 4.0.3

RUN curl -sSL "https://www.torproject.org/dist/torbrowser/${TOR_VERSION}/tor-browser-linux64-${TOR_VERSION}_en-US.tar.xz" | tar -v -C /usr/local/bin -xJ --strip-components 1 

WORKDIR $HOME
USER user

ENTRYPOINT ["/bin/bash"]
CMD [ "/usr/local/bin/start-tor-browser" ]
