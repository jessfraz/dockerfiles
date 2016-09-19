FROM alpine:latest
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apk --no-cache add \
	ca-certificates \
	python \
	py-pip \
	&& pip install dcoscli

# path to the DCOS CLI binary
RUN echo 'export PATH=$PATH:/dcos/bin;' >> ~/.bashrc

ENTRYPOINT [ "dcos" ]
