FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apk add --no-cache \
	ca-certificates \
	py-pip \
	&& pip install boto3


COPY ./reset-cache.py /bin/reset-cache.py

CMD [ "/usr/bin/python", "/bin/reset-cache.py" ]
