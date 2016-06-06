FROM alpine:latest

RUN apk --no-cache add \
	ca-certificates \
	python \
	py-pip \
	openjpeg-dev \
	&& pip install cli53

ENTRYPOINT [ "cli53" ]
