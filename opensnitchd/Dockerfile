# Usage:
#	docker run  -d \
#		--name=opensnitchd \
#		--net host \
#		--cap-add NET_ADMIN \
#		r.j3ss.co/opensnitchd
#
FROM alpine:latest

RUN apk add --no-cache \
	bash \
	iptables \
	libcap \
	libnetfilter_queue \
	libnfnetlink \
	python3 \
	py3-gobject3 \
	py3-qt5 \
	tcpdump \
	xtables-addons \
	--repository https://dl-3.alpinelinux.org/alpine/edge/testing

ENV XTABLES_LIBDIR "/usr/lib/xtables"
ENV OPENSNITCH_VERSION master

RUN buildDeps=' \
				build-base \
                git \
				libcap-dev \
				libnetfilter_queue-dev \
				libnfnetlink-dev \
				python3-dev \
	' \
	set -x \
	&& apk --no-cache add $buildDeps \
	&& git clone --depth 1 --branch ${OPENSNITCH_VERSION} https://github.com/evilsocket/opensnitch.git /usr/src/opensnitch \
	&& (  \
		cd /usr/src/opensnitch \
		&& python3 setup.py install \
		&& rm -rf /usr/src/opensnitch \
	) \
	&& apk del $buildDeps \
	&& echo "Build complete."

ENTRYPOINT ["/usr/bin/opensnitchd", "--debug"]
