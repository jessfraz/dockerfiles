FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
    build-essential \
    ca-certificates \
    curl \
    libasound2 \
    libgconf-2-4 \
    libgnome-keyring-dev \
    libgtk2.0-0 \
    libnss3 \
    libpci3 \
    libxtst6 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# install node
RUN curl -sL https://deb.nodesource.com/setup | bash -
RUN apt-get install -y nodejs

COPY    .   /usr/src/visualstudio/

ENTRYPOINT [ "/usr/src/visualstudio/Code" ]
