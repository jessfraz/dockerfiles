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

ENV SONARR_VERSION "develop"
RUN mkdir -p /opt/sonarr \
	&& wget "http://update.sonarr.tv/v2/${SONARR_VERSION}/mono/NzbDrone.${SONARR_VERSION}.tar.gz" -O /tmp/sonarr.tar.gz \
	&& tar -xzvf /tmp/sonarr.tar.gz -C /opt/sonarr --strip-components 1 \
	&& rm -rf /tmp/sonarr.tar.gz

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

# Create user and change ownership
RUN addgroup -g 666 -S sonarr \
	&& adduser -u 666 -SHG sonarr sonarr \
	&& mkdir -p /config \
	&& chown -R sonarr:sonarr /opt/sonarr /config

WORKDIR /opt/sonarr

USER sonarr

ENTRYPOINT ["entrypoint.sh"]
