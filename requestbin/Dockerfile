FROM python:3-alpine

RUN apk add --no-cache --virtual .build-deps \
		build-base \
	&& pip3 install --no-cache-dir  \
		gevent \
		gunicorn \
		requestbin \
	&& apk del .build-deps

CMD ["gunicorn", "-b", "0.0.0.0:8080", "requestbin:app", "--worker-class", "gevent"]
