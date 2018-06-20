# command to run Telnet
# docker run -it --rm \
#	--log-driver none \
#	jess/telnet "$@"
#
FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apk add --no-cache --virtual \
	busybox-extras

ENTRYPOINT [ "telnet" ]
