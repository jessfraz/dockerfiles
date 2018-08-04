# Usage:
#
# This uses a custom installs a kernel module hence the mounts

# docker run --rm -it \
# 	--name wireguard \
# 	-v /lib/modules:/lib/modules \
# 	-v /usr/src:/usr/src:ro \
# 	r.j3ss.co/wireguard:install
#
FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apk add --no-cache \
	build-base \
	ca-certificates \
	libelf-dev \
	libmnl-dev

# https://git.zx2c4.com/WireGuard/refs/
ENV WIREGUARD_VERSION 0.0.20180802

RUN set -x \
	&& apk add --no-cache --virtual .build-deps \
		git \
	&& git clone --depth 1 --branch "${WIREGUARD_VERSION}" https://git.zx2c4.com/WireGuard.git /wireguard \
	&& ( \
		cd /wireguard/src \
		&& make tools \
		&& make -C tools install \
		&& make -C tools clean \
	) \
	&& apk del .build-deps

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT [ "/usr/local/bin/entrypoint.sh" ]
CMD [ "wg", "--help" ]
