FROM debian:stretch
MAINTAINER Jessie Frazelle <jess@linux.com>

# run
# docker run -d -p 1234:80 -p 25:25 jess/mailman
#
# curl http://localhost:1234/cgi-bin/mailman/admin
# for admin screen

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && apt-get install -y \
	lighttpd \
	mailman \
	postfix \
	supervisor \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

# Lighttpd configuration
COPY lighttpd.conf /etc/lighttpd/lighttpd.conf

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 25 80

ENTRYPOINT [ "supervisord" ]
