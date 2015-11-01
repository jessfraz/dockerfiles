FROM alpine:latest
RUN apk update && apk add \
	openvpn \
	&& rm -rf /var/cache/apk/*

WORKDIR /etc/openvpn
ENTRYPOINT ["openvpn"]
