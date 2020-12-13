FROM debian:buster-slim
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

ENV DEBIAN_FRONTEND noninteractive

# install deps do this in sections so the layers are not mazzive
RUN dpkg --add-architecture i386 \
	&& apt-get update && apt-get install -y \
	automake \
	bc \
	binutils-dev \
	bison \
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
	hdparm \
	iperf \
	kmod \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y \
	libaudit-dev \
	libbabeltrace-ctf-dev \
	libc6-dev \
	libc6-dev:i386 \
	libdw-dev \
	libiberty-dev \
	libklibc-dev \
	liblzma-dev \
	libnuma-dev \
	libperl-dev \
	libslang2-dev \
	libssl-dev \
	libtool \
	libunwind-dev \
	linux-libc-dev \
	linux-libc-dev:i386 \
	linux-perf \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& ln -snf /usr/bin/perf_4.9 /usr/bin/perf

RUN apt-get update && apt-get install -y \
	make \
	nfs-common \
	openssl \
	patch \
	perl \
	procps \
	psmisc \
	python-dev \
	rsync \
	rt-tests \
	ruby \
	ruby-dev \
	sysstat \
	systemtap-sdt-dev \
	time \
	wget \
	zlib1g-dev \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV KERNEL_VERSION v4.13
ENV LKP_GIT_WORK_TREE /usr/src/linux
RUN git clone -b "${KERNEL_VERSION}" https://kernel.googlesource.com/pub/scm/linux/kernel/git/torvalds/linux.git "${LKP_GIT_WORK_TREE}"

ENV LKP_SRC /usr/src/lkp-tests
RUN	git clone https://github.com/fengguang/lkp-tests.git "${LKP_SRC}"

WORKDIR /usr/src/lkp-tests

RUN make install \
	&& lkp install

COPY runbench /usr/local/bin/runbench

CMD [ "lkp" ]
