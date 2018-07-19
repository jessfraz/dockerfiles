# Get the portage image as a build step
FROM gentoo/portage:latest as portage

FROM gentoo/stage3-amd64:latest

# Copy the portage volume in
COPY --from=portage /usr/portage /usr/portage

COPY etc/portage /etc/portage
# Update the world
RUN emerge --update --newuse --deep @world

# Install base packages
RUN emerge -qv \
	app-admin/sudo \
	app-arch/gzip \
	app-arch/tar \
	app-arch/unzip \
	app-arch/xz-utils \
	app-arch/zip \
	app-crypt/gnupg \
	app-crypt/pinentry \
	app-editors/neovim \
	app-misc/ca-certificates \
	app-misc/jq \
	app-pda/libimobiledevice \
	app-shells/bash \
	app-shells/bash-completion \
	app-text/tree \
	dev-util/indent \
	dev-util/strace \
	dev-vcs/git \
	net-dns/bind-tools \
	net-firewall/ebtables \
	net-firewall/ipset \
	net-firewall/iptables \
	net-firewall/nftables \
	net-misc/bridge-utils \
	net-misc/curl \
	net-misc/dhcpcd \
	net-misc/iputils \
	net-misc/ntp \
	net-misc/openssh \
	net-misc/rsync \
	net-misc/socat \
	net-misc/wget \
	net-misc/whois \
	net-wireless/iwd \
	sys-apps/apparmor \
	sys-apps/apparmor-utils \
	sys-apps/coreutils \
	sys-apps/dbus \
	sys-apps/diffutils \
	sys-apps/ethtool \
	sys-apps/file \
	sys-apps/findutils \
	sys-apps/fwupd \
	sys-apps/fwupdate \
	sys-apps/gawk \
	sys-apps/grep \
	sys-apps/iproute2 \
	sys-apps/kexec-tools \
	sys-apps/less \
	sys-apps/lshw \
	sys-apps/net-tools \
	sys-apps/nvme-cli \
	sys-apps/pciutils \
	sys-apps/rng-tools \
	sys-apps/sed \
	sys-apps/shadow \
	sys-apps/systemd \
	sys-apps/the_silver_searcher \
	sys-apps/usbutils \
	sys-apps/util-linux \
	sys-apps/which \
	sys-block/open-iscsi \
	sys-devel/gcc \
	sys-devel/make \
	sys-fs/btrfs-progs \
	sys-fs/dosfstools \
	sys-fs/e2fsprogs \
	sys-fs/lvm2 \
	sys-fs/mdadm \
	sys-fs/multipath-tools \
	sys-fs/quota \
	sys-fs/xfsprogs \
	sys-libs/glibc \
	sys-libs/nss-usrfiles \
	sys-libs/timezone-data \
	sys-process/lsof \
	sys-process/procps \
	sys-process/psmisc

# Insatll desktop packages
#RUN emerge -qv \
#	x11-misc/xclip \
#	x11-misc/xcompmgr \
#	x11-terms/rxvt-unicode
