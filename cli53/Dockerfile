FROM alpine:latest

RUN apk update && apk add \
	ca-certificates \
	python \
	py-pip \
	&& rm -rf /var/cache/apk/* \
	&& pip install cli53

ENTRYPOINT [ "cli53" ]
