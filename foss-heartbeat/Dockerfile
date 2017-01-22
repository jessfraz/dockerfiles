FROM alpine:latest

RUN apk add --no-cache \
	ca-certificates \
	gfortran \
	lapack \
    python

# Install the requirements
RUN set -x \
	&& apk add --no-cache --virtual .build-deps \
		build-base \
		git \
		lapack-dev \
		libffi-dev \
		libressl-dev \
		python-dev \
	py2-pip \
	&& ln -s /usr/include/locale.h /usr/include/xlocale.h \
	&& git clone --depth 1 https://github.com/sarahsharp/foss-heartbeat.git /usr/src/foss-heartbeat \
	&& ( \
		cd /usr/src/foss-heartbeat \
		&& pip install -r requirements.txt \
		&& pip install statistics \
	) \
	&& apk del .build-deps

# Install Stanford CoreNLP
RUN set -x \
	&& apk add --no-cache --virtual .build-deps \
		curl \
		git \
	&& git clone --depth 1 https://github.com/stanfordnlp/CoreNLP.git /usr/src/CoreNLP \
	&& ( \
		cd /usr/src/CoreNLP/liblocal \
		&& curl -sSLO http://nlp.stanford.edu/software/stanford-corenlp-models-current.jar \
		&& curl -sSLO http://nlp.stanford.edu/software/stanford-english-corenlp-models-current.jar \
	) \
	&& apk del .build-deps

WORKDIR /usr/src/foss-heartbeat
