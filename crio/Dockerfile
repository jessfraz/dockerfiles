# Usage:
# docker run --rm -it \
# 	--privileged \
#	--net host \
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
	iptables \
	libapparmor1 \
	libdevmapper1.02.1 \
	libgpgme11 \
	libseccomp2 \
	libselinux1 \
	thin-provisioning-tools \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV CRIO_VERSION v1.9.11
ENV GO_VERSION 1.9.4
ENV PLUGINS_VERSION v0.7.1
ENV RUNC_VERSION v0.1.1

# Install CNI plugins
# Install runc (installs to /sbin/runc)
# Install CRI-O (installs to /usr/bin/crio)
# NOTE: The install docker the templates package is a stop gap for it not being
# vendored into the crio repository
RUN buildDeps=' \
		curl \
		e2fslibs-dev \
		gcc \
		git \
		libapparmor-dev \
		libc6-dev \
		libdevmapper-dev \
		libgpgme11-dev \
		libostree-dev \
		libseccomp-dev \
		libselinux1-dev \
		make \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& curl -fsSL "https://golang.org/dl/go${GO_VERSION}.linux-amd64.tar.gz" | tar -xzC /usr/local \
	&& export PATH=/go/bin:/usr/local/go/bin:$PATH \
	&& export GOPATH="$(mktemp -d)" \
	&& git clone --depth 1 -b "$PLUGINS_VERSION" https://github.com/containernetworking/plugins.git "${GOPATH}/src/github.com/containernetworking/plugins" \
	&& ( \
		cd "${GOPATH}/src/github.com/containernetworking/plugins" \
		&& ./build.sh \
		&& mkdir -p /opt/cni/bin \
		&& mv bin/* /opt/cni/bin/ \
	) \
	&& git clone --depth 1 -b "$RUNC_VERSION" https://github.com/opencontainers/runc.git "${GOPATH}/src/github.com/opencontainers/runc" \
	&& ( \
		cd "${GOPATH}/src/github.com/opencontainers/runc" \
		&& make BUILDTAGS="seccomp selinux apparmor" \
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
		&& make binaries crio.conf BUILDTAGS="seccomp apparmor selinux $(./hack/btrfs_tag.sh) $(./hack/libdm_tag.sh) $(./hack/btrfs_installed_tag.sh)" \
		&& make install.bin install.config PREFIX="" \
		&& sed -i 's#runtime = "/usr/bin/runc"#runtime = "/sbin/runc"#' /etc/crio/crio.conf \
		&& sed -i 's#conmon = "/usr/local/libexec/crio/conmon"#conmon = "/libexec/crio/conmon"#' /etc/crio/crio.conf \
	) \
	&& rm -rf "$GOPATH" "/usr/local/go" \
	&& apt-get purge -y --auto-remove $buildDeps

COPY net.d /etc/cni/net.d
COPY policy.json /etc/containers/policy.json

CMD [ "crio" ]
