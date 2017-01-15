FROM alpine:edge

RUN apk add --no-cache \
	bash \
	ca-certificates \
	libsasl \
	postfix \
	rsyslog \
	runit

COPY service /etc/service
COPY runit_bootstrap /usr/sbin/runit_bootstrap
COPY rsyslog.conf /etc/rsyslog.conf

STOPSIGNAL SIGKILL

ENTRYPOINT ["/usr/sbin/runit_bootstrap"]
