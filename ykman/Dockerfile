# Run ykpersonalize in a container
#
# docker run --rm -it \
# 	--device /dev/bus/usb \
# 	--device /dev/usb
#	--name ykpersonalize \
#	jess/ykpersonalize
#
FROM ubuntu:16.04
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apt-get update && apt-get install -y \
	pcscd \
	procps \
	software-properties-common \
	--no-install-recommends && \
	add-apt-repository ppa:yubico/stable && \
	apt-get update && apt-get install -y \
	yubikey-manager \
	&& rm -rf /var/lib/apt/lists/*

ENV LC_ALL=C.UTF-8 LANG=C.UTF-8

WORKDIR /root/

COPY entrypoint.sh /usr/local/bin/

ENTRYPOINT [ "/usr/local/bin/entrypoint.sh" ]
CMD [ "ykman", "--help" ]
