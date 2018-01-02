FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apk --no-cache add \
    freeradius \
	freeradius-sqlite \
	freeradius-radclient \
	openssl-dev \
	sqlite

ENTRYPOINT [ "radiusd" ]
CMD [ "-xx","-f" ]
