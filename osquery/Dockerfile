FROM debian:buster-slim
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apt-get update && apt-get install -y \
	ca-certificates \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV OSQUERY_VERSION 3.3.0

RUN buildDeps=' \
		curl \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& mkdir -p /usr/src/osquery \
	&& curl -sSL "https://pkg.osquery.io/linux/osquery-${OSQUERY_VERSION}_1.linux_x86_64.tar.gz" | tar -vxzC / --strip-components 1 \
	&& apt-get purge -y --auto-remove $buildDeps \
	&& chmod a+x /usr/bin/osquery*

COPY osquery.example.conf /etc/osquery/osquery.conf

ENV HOME /home/user
RUN useradd --create-home --home-dir $HOME user \
    && chown -R user:user $HOME /etc/osquery /var/osquery /usr/share/osquery /var/log/osquery

WORKDIR $HOME

USER user

ENTRYPOINT [ "osqueryd", "--pidfile", "/home/user/osqueryd.pidfile" ]
CMD [ "--config_path=/etc/osquery/osquery.conf", "--verbose", "--docker_socket=/var/run/docker.sock", "--host_identifier=hostname", "--disable_distributed=false", "--distributed_plugin=tls" ]
