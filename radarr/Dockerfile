FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

ENV LANG "en_US.UTF-8"
ENV LANGUAGE "en_US.UTF-8"
ENV TERM "xterm"

RUN apk add --no-cache \
		bash \
		ca-certificates \
		libmediainfo \
		mono \
		tar \
		--repository https://dl-4.alpinelinux.org/alpine/edge/testing

# https://github.com/Radarr/Radarr/releases
ENV RADARR_VERSION 0.2.0.1480
RUN mkdir -p /opt/radarr \
	&& wget "https://github.com/Radarr/Radarr/releases/download/v${RADARR_VERSION}/Radarr.develop.${RADARR_VERSION}.linux.tar.gz" -O /tmp/radarr.tar.gz \
	&& tar -xzvf /tmp/radarr.tar.gz -C /opt/radarr --strip-components 1 \
	&& rm -rf /tmp/radarr.tar.gz

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

# Create user and change ownership
RUN addgroup -g 666 -S radarr \
	&& adduser -u 666 -SHG radarr radarr \
	&& mkdir -p /config \
	&& chown -R radarr:radarr /opt/radarr /config

WORKDIR /opt/radarr

USER radarr

ENTRYPOINT ["entrypoint.sh"]
