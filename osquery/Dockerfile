FROM debian:buster-slim
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apt-get update && apt-get install -y \
	ca-certificates \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV OSQUERY_VERSION 4.0.0

RUN buildDeps=' \
		clang \
		cmake \
		git \
		libc++-dev \
		libc++abi-dev \
		liblzma-dev \
		llvm \
		make \
		python \
		python3 \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& mkdir -p /usr/src/osquery/build \
	&& git clone --branch "${OSQUERY_VERSION}" --depth 1 https://github.com/osquery/osquery.git /usr/src/osquery/src \
	&& cd /usr/src/osquery \
	&& ls -la src/ \
	&& cd build \
	&& cmake ../src -DCMAKE_C_COMPILER=clang -DCMAKE_CXX_COMPILER=clang++ \
	&& cmake --build . -j # // where # is the number of parallel build jobs \
	&& ls -la \
	&& apt-get purge -y --auto-remove $buildDeps \
	&& chmod a+x /usr/bin/osquery*

COPY osquery.example.conf /etc/osquery/osquery.conf

ENV HOME /home/user
RUN mkdir -p /var/osquery /usr/share/osquery /var/log/osquery \
	&& useradd --create-home --home-dir $HOME user \
    && chown -R user:user $HOME /etc/osquery /var/osquery /usr/share/osquery /var/log/osquery

WORKDIR $HOME

USER user

ENTRYPOINT [ "osqueryd", "--pidfile", "/home/user/osqueryd.pidfile" ]
CMD [ "--config_path=/etc/osquery/osquery.conf", "--verbose", "--docker_socket=/var/run/docker.sock", "--host_identifier=hostname", "--disable_distributed=false", "--distributed_plugin=tls" ]
