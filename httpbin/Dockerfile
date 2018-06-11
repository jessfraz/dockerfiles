FROM python:3-alpine

RUN apk add --no-cache --virtual .build-deps \
		build-base \
		libffi-dev \
	&& pip3 install --no-cache-dir  \
		gevent \
		gunicorn \
		httpbin \
	&& apk del .build-deps

CMD ["gunicorn", "-b", "0.0.0.0:80", "httpbin:app", "-k", "gevent"]
