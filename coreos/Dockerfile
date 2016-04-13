# coreos base container
#
# docker run --rm -it \
# 	--cap-add SYS_ADMIN \
# 	--security-opt seccomp:/path/to/systemd-seccomp.json \
# 	--tmpfs /run:rw --tmpfs /tmp:rw \
# 	-e "container=coreos-rootfs" \
# 	-v /sys/fs/cgroup:/sys/fs/cgroup:ro \
# 	jess/coreos
FROM scratch

ENV container=docker

ADD coreos-766.5.0.tar.xz /
COPY ./certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

RUN ( \
		cd /lib/systemd/system/sysinit.target.wants/; \
		for i in *; do \
			if [ "$i" != "systemd-tmpfiles-setup.service" ]; then \
				rm -f $i; \
			fi \
		done \
		) \
		&& rm -f /lib/systemd/system/multi-user.target.wants/* \
		&& rm -f /etc/systemd/system/*.wants/* \
		&& rm -f /lib/systemd/system/local-fs.target.wants/* \
		&& rm -f /lib/systemd/system/sockets.target.wants/*udev* \
		&& rm -f /lib/systemd/system/sockets.target.wants/*initctl* \
		&& rm -f /lib/systemd/system/anaconda.target.wants/* \
		&& rm -f /lib/systemd/system/basic.target.wants/* \
		&& rm -f /lib/systemd/system/graphical.target.wants/* \
		&& ln -vf /lib/systemd/system/multi-user.target /lib/systemd/system/default.target

# systemd needs a different stop signal
STOPSIGNAL SIGRTMIN+3

CMD ["/sbin/init"]
