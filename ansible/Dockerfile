# https://www.ansible.com/
#
# docker run --rm \
# 	-it \
# 	-v ${PWD}/hosts:/etc/ansible/hosts \
# 	-v ${PWD}/ansible.cfg:/etc/ansible/ansible.cfg \
# 	-v ${HOME}/.ssh:/root/.ssh:ro \
# 	ansible all -m ping
#
FROM alpine:latest
MAINTAINER Christian Koep <christiankoep@gmail.com>

RUN builddeps=' \
		python-dev \
		py-pip \
		musl-dev \
		openssl-dev \
		libffi-dev \
		gcc \
		' \
	&& apk update \
	&& apk add \
	ca-certificates \
	python \
	py-paramiko \
	py-yaml \
	py-jinja2 \
	py-httplib2 \
	$builddeps \
	&& rm -rf /var/cache/apk/* \
	&& pip install --upgrade pip \
	&& pip install \
		ansible \
		six \
	&& apk del --purge $builddeps

ENTRYPOINT [ "ansible" ]
