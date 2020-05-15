# Run libvirt deamon in a container
#
# docker run -d \
#	--privileged \
#	-v /var/run/libvirt:/var/run/libvirt \
#	--name kvm \
#	jess/kvm
#
FROM debian:sid-slim
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apt-get update && apt-get install -y \
	dnsmasq \
	gir1.2-spiceclientgtk-3.0 \
	iproute2 \
	iptables \
	libgl1-mesa-dri \
	libgl1-mesa-glx \
	libvirt-daemon-system \
	procps \
	python-gi \
	qemu-kvm \
	virtinst \
	virt-manager \
	virt-viewer \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

COPY ./start.sh /start.sh

ENTRYPOINT ["/start.sh"]
CMD ["virt-manager", "--no-fork"]
