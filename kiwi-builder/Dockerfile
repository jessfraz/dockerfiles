FROM opensuse

RUN zypper ar http://download.opensuse.org/repositories/Virtualization:/Appliances/openSUSE_12.3 virtualization:appliances \
	&& zypper --non-interactive install \
	kiwi \
	kiwi-doc \
	lxc

ENV HOME /root
WORKDIR /usr/src

RUN cp -r /usr/share/doc/packages/kiwi/examples/suse-13.1/suse-docker-container /usr/src/

COPY config.xml /usr/src/suse-docker-container/
COPY config.sh /usr/src/suse-docker-container/

RUN kiwi --prepare /usr/src/suse-docker-container --root /tmp/suse-rootfs \
	&& tar cvpf suse-rootfs.tar -C /tmp/suse-rootfs/ . \
	&& mkdir -p artifacts
