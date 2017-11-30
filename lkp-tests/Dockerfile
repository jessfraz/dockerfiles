FROM debian:buster
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

ENV DEBIAN_FRONTEND noninteractive
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
	nfs-common \
	openssl \
	patch \
	perl \
	psmisc \
	rsync \
	ruby \
	ruby-dev \
	sysstat \
	time \
	wget \
	zlib1g-dev \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& ln -snf /usr/bin/perf_4.9 /usr/bin/perf

ENV KERNEL_VERSION v4.13
ENV LKP_GIT_WORK_TREE /usr/src/linux
RUN git clone -b "${KERNEL_VERSION}" https://kernel.googlesource.com/pub/scm/linux/kernel/git/torvalds/linux.git "${LKP_GIT_WORK_TREE}"

ENV LKP_SRC /usr/src/lkp-tests
RUN	git clone https://github.com/fengguang/lkp-tests.git "${LKP_SRC}"

WORKDIR /usr/src/lkp-tests

RUN make install \
	&& lkp install

# Create the lkp user and group
RUN groupadd --gid 1090 lkp
RUN useradd --uid 1090 --gid 1090 lkp

COPY runbench /usr/local/bin/runbench

CMD [ "lkp" ]
