# Usage:
# docker run --rm -it \
# 	--privileged \
#	-v /var/lib/containers:/var/lib/containers \
#	-v /var/run:/var/run \
#	-v /dev:/dev \
#	-v /etc/cni:/etc/cni:ro \
#	-v /opt/cni:/opt/cni:ro \
#	r.j3ss.co/crio
#
FROM debian:sid
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

# Install CRI-O/runc/ostree dependencies
RUN apt-get update && apt-get install -y \
	autoconf \
	automake \
	bison \
	btrfs-tools \
	ca-certificates \
	curl \
	e2fslibs-dev \
	gcc \
	git \
	libapparmor-dev \
	libassuan-dev \
	libc6-dev \
	libdevmapper-dev \
	libfuse-dev \
	libglib2.0-dev \
	libgpg-error-dev \
	libgpgme11-dev \
	liblzma-dev \
	libseccomp-dev \
	libselinux1-dev \
	libtool \
	make \
	pkg-config \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

# Install ostree
ENV OSTREE_VERSION v2017.12
RUN set -x \
	&& export BUILDPATH="$(mktemp -d)" \
	&& git clone --depth 1 -b "$OSTREE_VERSION" --recursive https://github.com/ostreedev/ostree.git "${BUILDPATH}/ostree" \
	&& ( \
		cd "${BUILDPATH}/ostree" \
		&& git submodule update --init \
		&& env NOCONFIGURE=1 ./autogen.sh \
		&& ./configure --prefix=/ \
		&& make \
		&& make install \
	) \
	&& rm -rf "$BUILDPATH"

# Install Go
ENV GO_VERSION 1.9.1
RUN curl -fsSL "https://golang.org/dl/go${GO_VERSION}.linux-amd64.tar.gz" \
	| tar -xzC /usr/local

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

# Install runc (installs to /sbin/runc)
ENV RUNC_VERSION v1.0.0-rc4
RUN set -x \
	&& export GOPATH="$(mktemp -d)" \
	&& git clone --depth 1 -b "$RUNC_VERSION" https://github.com/opencontainers/runc.git "${GOPATH}/src/github.com/opencontainers/runc" \
	&& ( \
		cd "${GOPATH}/src/github.com/opencontainers/runc" \
		&& make static BUILDTAGS="seccomp selinux apparmor" \
		&& make install PREFIX="" \
	) \
	&& rm -rf "$GOPATH"

# Install CRI-O (installs to /usr/bin/crio)
# NOTE: The install docker the templates package is a stop gap for it not being
# vendored into the crio repository
ENV CRIO_VERSION v1.0.0
RUN set -x \
	&& export GOPATH="$(mktemp -d)" \
	&& ( \
		go get -u github.com/docker/docker/daemon/logger/templates \
		&& cd "${GOPATH}/src/github.com/docker/docker" \
		&& mkdir -p utils \
		&& cp -r daemon/logger/templates utils/ \
	) \
	&& git clone --depth 1 -b "$CRIO_VERSION" https://github.com/kubernetes-incubator/cri-o.git "${GOPATH}/src/github.com/kubernetes-incubator/cri-o" \
	&& ( \
		cd "${GOPATH}/src/github.com/kubernetes-incubator/cri-o" \
		&& make binaries crio.conf BUILDTAGS="seccomp apparmor selinux" \
		&& make install.bin install.config PREFIX="" \
	) \
	&& rm -rf "$GOPATH"

CMD [ "crio" ]
