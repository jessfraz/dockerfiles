FROM python:2-alpine
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

ENV LANG "en_US.UTF-8"
ENV LANGUAGE "en_US.UTF-8"
ENV TERM "xterm"

RUN apk add --no-cache \
		bash \
		ca-certificates \
		ffmpeg \
		git \
		--repository https://dl-4.alpinelinux.org/alpine/edge/testing

ENV NZBGET_VERSION 21.0
RUN wget "https://github.com/nzbget/nzbget/releases/download/v${NZBGET_VERSION}/nzbget-${NZBGET_VERSION}-bin-linux.run" -O /tmp/nzbget.run \
	&& bash /tmp/nzbget.run --destdir /opt/nzbget \
    && git clone --depth=1 "https://github.com/clinton-hall/nzbToMedia.git" /opt/nzbget/scripts/nzbToMedia \
	&& rm -f /tmp/nzbget.bin

COPY nzbget.conf /config/nzbget.conf

RUN addgroup -g 666 -S nzbget \
	&& adduser -u 666 -SHG nzbget nzbget \
	&& mkdir -p /movies /downloads /comics /tvseries \
	&& chown -R nzbget:nzbget /movies /downloads /comics /tvseries /config /opt/nzbget

USER nzbget

ENTRYPOINT [ "/opt/nzbget/nzbget", "-s", "-o", "FlushQueue=no", "-o", "OutputMode=loggable", "-c", "/config/nzbget.conf" ]
