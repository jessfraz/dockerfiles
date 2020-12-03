FROM debian:bullseye-slim
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

ENV LANG=en_US.UTF-8

RUN apt-get update && apt-get install -y \
	ca-certificates \
	curl \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

# Add our user first to make sure the ID get assigned consistently,
# regardless of whatever dependencies get added.
RUN groupadd -r mitmproxy && useradd -r -g mitmproxy mitmproxy \
    && mkdir -p /home/mitmproxy/.mitmproxy \
	&& chown -R mitmproxy:mitmproxy /home/mitmproxy

# Download the binaries.
ENV MITMPROXY_VERSION 5.1.1
RUN curl -sSL "https://snapshots.mitmproxy.org/${MITMPROXY_VERSION}/mitmproxy-${MITMPROXY_VERSION}-linux.tar.gz" | tar -vxzC /usr/local/bin

VOLUME /home/mitmproxy/.mitmproxy

COPY docker-entrypoint.sh /usr/local/bin/

EXPOSE 8080 8081

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["mitmproxy"]
