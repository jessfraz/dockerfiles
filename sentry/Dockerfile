FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
    g++ \
    libpq5 \
    libpq-dev \
    libxml2-dev \
    locales \
    postgresql-client-9.4 \
    postgresql-client-common \
    python \
    python-dev \
    python-pip \
    --no-install-recommends

# locales
ENV LANGUAGE en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LC_ALL en_US.UTF-8
RUN locale-gen en_US.UTF-8
RUN dpkg-reconfigure locales

RUN pip install psycopg2
RUN pip install sentry

EXPOSE 9000

ADD sentry.conf.py /sentry.conf.py

ENTRYPOINT ["/usr/local/bin/sentry", "--config=/sentry.conf.py"]

CMD ["upgrade"]
