# Run slack desktop app in a container
#
# xhost +local:docker && docker run -d --rm -it \
#	-v /etc/localtime:/etc/localtime:ro \
#	-v /tmp/.X11-unix:/tmp/.X11-unix \
#	-e DISPLAY=unix$DISPLAY \
#	--device /dev/snd \
#	--device /dev/dri \
#	--device /dev/video0 \
#	--group-add audio \
#	--group-add video \
#	--ipc="host" \
#	--name bluejeans \
#	docker.io/wtcross/bluejeans:1.37.19 "$@"

FROM centos:centos7
LABEL maintainer "Tyler Cross <tyler@cross.solutions>"

ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8

RUN yum update -y && \
	yum upgrade -y && \
	yum install -y gtk2 GConf2 alsa-lib libXtst libnotify libcanberra-gtk2 libcanberra-devel \
				   mesa-dri-drivers PackageKit PackageKit-yum PackageKit-gtk3-module firefox && \
	yum install -y https://swdl.bluejeans.com/desktop/linux/1.37/1.37.19/bluejeans-1.37.19.x86_64.rpm

ENTRYPOINT ["/usr/bin/bluejeans"]
