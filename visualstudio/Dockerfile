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
	unzip \
	zip \
	--no-install-recommends

# install node
RUN curl -sL https://deb.nodesource.com/setup | bash -
RUN apt-get update && apt-get install -y \
	nodejs \
	&& rm -rf /var/lib/apt/lists/*

# download the source
RUN curl -sSL https://jesss.s3.amazonaws.com/binaries/VSCode-linux-x64.zip -o /tmp/vs.zip \
	&& unzip /tmp/vs.zip -d /usr/src/ \
	&& rm -rf /tmp/vs.zip

ENTRYPOINT [ "/usr/src/VSCode-linux-x64/Code" ]
