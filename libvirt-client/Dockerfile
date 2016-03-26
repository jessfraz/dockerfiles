FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apk update && apk add \
	libvirt-client \
	&& rm -rf /var/cache/apk/*

CMD [ "virsh" ]
