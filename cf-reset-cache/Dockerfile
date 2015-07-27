FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apk update && apk add \
	ca-certificates \
	openssl \
	python \
	python-dev \
	py-pip \
	build-base \
	&& rm -rf /var/cache/apk/* \
	&& pip install boto

COPY ./reset-cache.py /bin/reset-cache.py

CMD [ "/usr/bin/python", "/bin/reset-cache.py" ]
