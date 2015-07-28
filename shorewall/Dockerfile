# shorewall in a container
#
# docker run --rm -it \
# 	--net host \
# 	--cap-add NET_ADMIN \
#	--privileged \
# 	jess/shorewall
#
FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apk update && apk add \
	shorewall \
	&& rm -rf /var/cache/apk/* \
	&& touch /var/log/messages

COPY ./etc /etc/shorewall

ENTRYPOINT [ "/usr/sbin/shorewall" ]
