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
	btrfs-tools \
	ca-certificates \
	thin-provisioning-tools \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV OSTREE_VERSION v2017.12
ENV GO_VERSION 1.9.1
ENV RUNC_VERSION v1.0.0-rc4
ENV CRIO_VERSION v1.0.0

# Install ostree
# Install runc (installs to /sbin/runc)
# Install CRI-O (installs to /usr/bin/crio)
# NOTE: The install docker the templates package is a stop gap for it not being
# vendored into the crio repository
RUN buildDeps=' \
		autoconf \
		automake \
		bison \
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
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& export BUILDPATH="$(mktemp -d)" \
	&& git clone --depth 1 -b "$OSTREE_VERSION" --recursive https://github.com/ostreedev/ostree.git "${BUILDPATH}/ostree" \
	&& ( \
		cd "${BUILDPATH}/ostree" \
		&& git submodule update --init \
		&& env NOCONFIGURE=1 ./autogen.sh \
		&& ./configure --prefix="" \
		&& make \
		&& make install \
	) \
	&& curl -fsSL "https://golang.org/dl/go${GO_VERSION}.linux-amd64.tar.gz" | tar -xzC /usr/local \
	&& export PATH=/go/bin:/usr/local/go/bin:$PATH \
	&& export GOPATH="$(mktemp -d)" \
	&& git clone --depth 1 -b "$RUNC_VERSION" https://github.com/opencontainers/runc.git "${GOPATH}/src/github.com/opencontainers/runc" \
	&& ( \
		cd "${GOPATH}/src/github.com/opencontainers/runc" \
		&& sed -i "s#go build -i#go build#" Makefile \
		&& make static BUILDTAGS="seccomp selinux apparmor" EXTRA_FLAGS="-a -installsuffix netgo" \
		&& make install PREFIX="" \
	) \
	&& ( \
		go get -u github.com/docker/docker/daemon/logger/templates \
		&& cd "${GOPATH}/src/github.com/docker/docker" \
		&& mkdir -p utils \
		&& cp -r daemon/logger/templates utils/ \
	) \
	&& git clone --depth 1 -b "$CRIO_VERSION" https://github.com/kubernetes-incubator/cri-o.git "${GOPATH}/src/github.com/kubernetes-incubator/cri-o" \
	&& ( \
		cd "${GOPATH}/src/github.com/kubernetes-incubator/cri-o" \
		&& sed -i "s#-ldflags '#-a -installsuffix netgo -ldflags '-linkmode external -s -extldflags -static #" Makefile \
		&& CGO_ENABLED=1 make binaries crio.conf BUILDTAGS="netgo cgo seccomp apparmor selinux $(./hack/btrfs_tag.sh) $(./hack/libdm_tag.sh) $(./hack/btrfs_installed_tag.sh)" \
		&& make install.bin install.config PREFIX="" \
		&& sed -i 's#runtime = "/usr/bin/runc"#runtime = "/sbin/runc"#' /etc/crio/crio.conf \
	) \
	&& rm -rf "$BUILDPATH" "$GOPATH" "/usr/local/go" \
	&& find / -iname "*ostree*" | xargs rm -vrf \
	&& apt-get purge -y --auto-remove $buildDeps

CMD [ "crio" ]
