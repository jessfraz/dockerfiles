FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apk --no-cache add \
    freeradius \
	freeradius-sqlite \
	freeradius-radclient \
	openssl-dev \
	sqlite

RUN	chgrp radius /usr/sbin/radiusd \
	&& chmod g+rwx /usr/sbin/radiusd

ENTRYPOINT [ "radiusd" ]
CMD [ "-xx","-f" ]
