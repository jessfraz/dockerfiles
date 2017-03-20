FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apk --no-cache add \
	ca-certificates \
	git \
	python \
	py-boto \
	py-paramiko

RUN git clone --depth 1 https://github.com/newsapps/beeswithmachineguns /usr/src/beeswithmachineguns \
	&& cd /usr/src/beeswithmachineguns \
	&& python setup.py install \
	&& rm -rf /usr/src/beeswithmachineguns

ENTRYPOINT [ "bees" ]
