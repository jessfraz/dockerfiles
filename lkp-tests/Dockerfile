FROM debian:stretch
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN dpkg --add-architecture i386 \
	&& apt-get update && apt-get install -y \
	automake \
	bc \
	binutils-dev \
	bison \
	bsdtar \
	build-essential \
	bzip2 \
	ca-certificates \
	cpio \
	fakeroot \
	flex \
	gawk \
	gcc \
	git \
	gzip \
	kmod \
	libaudit-dev \
	libc6-dev \
	libc6-dev:i386 \
	libdw-dev \
	libiberty-dev \
	libklibc-dev \
	liblzma-dev \
	libnuma-dev \
	libtool \
	libunwind-dev \
	linux-libc-dev \
	linux-libc-dev:i386 \
	linux-perf \
	make \
	openssl \
	patch \
	perl \
	rsync \
	ruby \
	ruby-dev \
	sysstat \
	time \
	wget \
	zlib1g-dev \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN	git clone --depth 1 https://github.com/fengguang/lkp-tests.git /usr/src/lkp-tests

WORKDIR /usr/src/lkp-tests

RUN make install \
	&& lkp install

# Create the lkp user and group
RUN groupadd --gid 1090 lkp
RUN useradd --uid 1090 --gid 1090 lkp

COPY runbench /usr/local/bin/runbench

CMD [ "lkp" ]
