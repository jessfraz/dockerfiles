FROM ubuntu:bionic
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y \
	apt-transport-https \
	ca-certificates \
	curl \
	gnupg2 \
	libc++1 \
	tar \
	xz-utils \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& curl -sSL https://apt.kitware.com/keys/kitware-archive-latest.asc | apt-key add - \
	&& echo 'deb https://apt.kitware.com/ubuntu/ bionic main' > /etc/apt/sources.list.d/cmake.list

ENV OSQUERY_VERSION 4.3.0

RUN buildDeps=' \
		bison \
		clang \
		cmake \
		flex \
		git \
		libc++-dev \
		libc++abi-dev \
		liblzma-dev \
		libssl-dev \
		llvm \
		make \
		python \
		python3 \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& mkdir -p /usr/src/osquery/build /usr/share/osquery \
	&& git clone --branch "${OSQUERY_VERSION}" --depth 1 https://github.com/osquery/osquery.git /usr/src/osquery/src \
	&& cd /usr/src/osquery \
	&& ls -la src/ \
	&& cd build \
	&& curl -sSL https://github.com/osquery/osquery-toolchain/releases/download/1.0.0/osquery-toolchain-1.0.0.tar.xz | tar -xJ -C /usr/local \
	&& cmake -DOSQUERY_TOOLCHAIN_SYSROOT=/usr/local/osquery-toolchain ../src  \
	&& cmake --build . \
	&& mv osquery/osqueryd /usr/bin \
	&& mv package/linux/osqueryctl /usr/bin \
	&& mkdir -p /usr/share/osquery/certs \
	&& cp ../src/tools/deployment/certs.pem /usr/share/osquery/certs/ \
	&& apt-get purge -y --auto-remove $buildDeps \
	&& chmod a+x /usr/bin/osquery* \
	&& cp -r /usr/src/osquery/src/packs /usr/share/osquery/

COPY osquery.example.conf /etc/osquery/osquery.conf

ENV HOME /home/user
RUN mkdir -p /var/osquery /var/log/osquery \
	&& useradd --create-home --home-dir $HOME user \
    && chown -R user:user $HOME /etc/osquery /var/osquery /usr/share/osquery /var/log/osquery

WORKDIR $HOME

USER user

ENTRYPOINT [ "osqueryd", "--pidfile", "/home/user/osqueryd.pidfile" ]
CMD [ "--config_path=/etc/osquery/osquery.conf", "--verbose", "--docker_socket=/var/run/docker.sock", "--host_identifier=hostname", "--disable_distributed=false", "--distributed_plugin=tls" ]
