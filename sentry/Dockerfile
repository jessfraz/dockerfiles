FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	g++ \
	libffi-dev \
	libpq5 \
	libpq-dev \
	libxml2-dev \
	libxslt1-dev \
	locales \
	postgresql-client-9.4 \
	postgresql-client-common \
	python \
	python-dev \
	python-pip \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

# locales
ENV	LANGUAGE		en_US.UTF-8
ENV	LANG			en_US.UTF-8
ENV	LC_ALL			en_US.UTF-8
ENV	DEBIAN_FRONTEND	noninteractive
RUN	locale-gen en_US.UTF-8 \
	&& dpkg-reconfigure locales

RUN pip install psycopg2 sentry

EXPOSE 9000

ADD sentry.conf.py /sentry.conf.py

ENTRYPOINT ["/usr/local/bin/sentry", "--config=/sentry.conf.py"]

CMD ["upgrade"]
