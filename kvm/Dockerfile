# Run libvirt deamon in a container
#
# docker run -d \
#	--privileged \
#	-v /var/run/libvirt:/var/run/libvirt \
#	--name kvm \
#	jess/kvm
#
FROM debian:sid
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	iptables \
	libgl1-mesa-dri \
	libgl1-mesa-glx \
	libvirt-daemon-system \
	python-gi \
	python-ipaddr \
	qemu-kvm \
	virtinst \
	virt-viewer \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

COPY ./start.sh /start.sh

ENTRYPOINT ["/start.sh"]
CMD ["libvirtd"]
