# https://www.ansible.com/
#
# docker run --rm \
# 	-it \
# 	-v ${PWD}/hosts:/etc/ansible/hosts \
# 	-v ${PWD}/ansible.cfg:/etc/ansible/ansible.cfg \
# 	-v ${HOME}/.ssh:/root/.ssh:ro \
# 	ansible all -m ping
#
FROM python:3-alpine
LABEL maintainer "Christian Koep <christiankoep@gmail.com>"

RUN builddeps=' \
		musl-dev \
		openssl-dev \
		libffi-dev \
		gcc \
		' \
	&& apk --no-cache add \
	ca-certificates \
	$builddeps \
	&& pip install \
		ansible \
	&& apk del --purge $builddeps

ENTRYPOINT [ "ansible" ]
