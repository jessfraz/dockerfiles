# shorewall in a container
#
# docker run --rm -it \
# 	--net host \
# 	--cap-add NET_ADMIN \
#	--privileged \
# 	jess/shorewall
#
FROM alpine:latest
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apk --no-cache add \
	shorewall \
	&& touch /var/log/messages

COPY ./etc /etc/shorewall

ENTRYPOINT [ "/usr/sbin/shorewall" ]
