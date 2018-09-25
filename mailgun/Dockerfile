FROM r.j3ss.co/curl
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apk add --no-cache \
	bash

COPY sendmail /usr/bin/sendmail

ENTRYPOINT [ "sendmail" ]
