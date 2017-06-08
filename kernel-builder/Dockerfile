FROM debian:sid
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apt-get update && apt-get install -y \
	ca-certificates \
	curl \
	gnupg \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN echo "deb [arch=amd64,arm64,ppc64el] http://emdebian.org/tools/debian/ unstable main" > /etc/apt/sources.list.d/crosstools.list
RUN curl http://emdebian.org/tools/debian/emdebian-toolchain-archive.key | apt-key add -

RUN dpkg --add-architecture arm64 \
	&& dpkg --add-architecture ppc64el \
	&& apt-get update && apt-get install -y \
	crossbuild-essential-arm64 \
	crossbuild-essential-ppc64el \
	git \
	kernel-package \
	make \
	libncurses5-dev \
	libssl-dev \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV HOME /root
WORKDIR $HOME

ENV JOBS 4

COPY install_kernel /usr/local/bin/install_kernel

CMD [ "bash" ]
