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
	software-properties-common \
	--no-install-recommends && \
	add-apt-repository ppa:yubico/stable && \
	apt-get update && apt-get install -y \
	ca-certificates \
	curl \
	libjson0 \
	libusb-1.0-0 \
	libyubikey0 \
	pcscd \
	procps \
	usbutils \
	yubikey-personalization \
	yubico-piv-tool \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /root/

COPY entrypoint.sh /usr/local/bin/

ENTRYPOINT [ "/usr/local/bin/entrypoint.sh" ]
CMD [ "ykpersonalize", "--help" ]
