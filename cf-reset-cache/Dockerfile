FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apk add --no-cache \
	py-boto


COPY ./reset-cache.py /bin/reset-cache.py

CMD [ "/usr/bin/python", "/bin/reset-cache.py" ]
