FROM python:2-alpine

RUN apk add --no-cache --virtual .build-deps \
		build-base \
		git \
		libffi-dev \
		--repository http://dl-cdn.alpinelinux.org/alpine/edge/main/ \
	&& git clone --depth 1 https://github.com/Runscope/requestbin /src \
	&& sed -i 's/gevent/gevent==1.4.0/' /src/requirements.txt \
	&& echo "Flask==1.1.1" >> /src/requirements.txt \
	&& echo "Werkzeug==0.15.6" >> /src/requirements.txt \
    && pip install -r /src/requirements.txt \
    && rm -rf ~/.pip/cache \
	&& apk del .build-deps

WORKDIR /src

CMD ["gunicorn", "-b", "0.0.0.0:8080", "requestbin:app", "-k", "gevent"]
