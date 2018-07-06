FROM alpine:latest

RUN apk add --no-cache \
	ca-certificates \
	bash \
	gfortran \
	openjdk8-jre-base \
	lapack \
	python \
	py-pip \
	py-numpy

# Install the requirements
RUN set -x \
	&& apk add --no-cache --virtual .build-deps \
		build-base \
		git \
		lapack-dev \
		libffi-dev \
		openssl-dev \
		python-dev \
	&& ln -s /usr/include/locale.h /usr/include/xlocale.h \
	&& git clone --depth 1 https://github.com/sarahsharp/foss-heartbeat.git /usr/src/foss-heartbeat \
	&& ( \
		cd /usr/src/foss-heartbeat \
		&& pip install -r requirements.txt \
		&& pip install statistics \
	) \
	&& apk del .build-deps

WORKDIR /usr/src/foss-heartbeat
