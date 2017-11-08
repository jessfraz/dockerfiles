# Usage:
#	docker run  -d \
#		--name=opensnitchd \
#		--net host \
#		--cap-add NET_ADMIN \
#		r.j3ss.co/opensnitchd
#
FROM debian:sid

RUN apt-get update && apt-get install -y \
	ca-certificates \
	iptables \
	libcap2 \
	libnetfilter-queue1 \
	libnfnetlink0 \
	python3 \
	python3-dbus \
	python3-dev \
	python3-gi \
	python3-pyinotify \
	python3-pyqt5 \
	python3-setuptools \
	tcpdump \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV XTABLES_LIBDIR "/usr/lib/xtables"
ENV OPENSNITCH_VERSION master

RUN buildDeps=' \
				build-essential \
				git \
				libcap-dev \
				libnetfilter-queue-dev \
				libnfnetlink-dev \
				python3-dev \
	' \
	set -x \
	&& apt-get update && apt-get install -y \
 		$buildDeps \
		--no-install-recommends \
		&& rm -rf /var/lib/apt/lists/* \
	&& git clone --depth 1 --branch ${OPENSNITCH_VERSION} https://github.com/evilsocket/opensnitch.git /usr/src/opensnitch \
	&& (  \
		cd /usr/src/opensnitch \
		&& python3 setup.py install \
		&& rm -rf /usr/src/opensnitch \
	) \
	&& apt-get purge -y $buildDeps \
	&& echo "Build complete."

ENTRYPOINT ["/usr/local/bin/opensnitchd", "--debug"]
