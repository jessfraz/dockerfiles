FROM opensuse

RUN zypper --non-interactive install \
	kiwi \
	kiwi-doc \
	lxc

ENV HOME /root
WORKDIR /usr/src

RUN cp -r /usr/share/doc/packages/kiwi/examples/suse-13.1/suse-docker-container /usr/src/

COPY config.xml /usr/src/suse-docker-container/
COPY config.sh /usr/src/suse-docker-container/

RUN kiwi --prepare /usr/src/suse-docker-container --root /suse-rootfs

COPY oss.repo /suse-rootfs/etc/zypp/repos.d/
COPY update.repo /suse-rootfs/etc/zypp/repos.d/

RUN tar cvpf suse-rootfs.tar -C /suse-rootfs/ . \
	&& mkdir -p artifacts
