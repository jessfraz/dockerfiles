FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	ca-certificates \
	curl \
	unzip \
	--no-install-recommends \ 
	&& rm -rf /var/lib/apt/lists/*

ENV CONSUL_VERSION 0.5.2
ADD https://jesss.s3.amazonaws.com/binaries/consul/${CONSUL_VERSION}/consul /usr/local/bin/consul
ADD https://jesss.s3.amazonaws.com/binaries/curl-unix-socket /usr/local/bin/curl-unix-socket

# download the ui
RUN curl -sSL https://jesss.s3.amazonaws.com/binaries/consul/${CONSUL_VERSION}/ui.zip -o /tmp/ui.zip \
	&& unzip /tmp/ui.zip -d /usr/src/ \
	&& rm -rf /tmp/ui.zip \
	&& mv /usr/src/dist /usr/src/consul \
	&& mkdir -p /etc/consul.d/ \
	&& chmod +x /usr/local/bin/consul \
	&& chmod +x /usr/local/bin/curl-unix-socket

ENTRYPOINT [ "/usr/local/bin/consul" ]
