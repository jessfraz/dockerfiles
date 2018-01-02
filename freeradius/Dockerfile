FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apk --no-cache add \
    freeradius \
	freeradius-python \
	freeradius-radclient \
	freeradius-sqlite \
	openssl-dev \
	sqlite

ENTRYPOINT [ "radiusd" ]
CMD [ "-xx","-f" ]
