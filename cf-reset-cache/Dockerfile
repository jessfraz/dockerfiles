FROM python:2.7.8
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN pip install boto

ADD reset-cache.py /bin/reset-cache
RUN chmod +x /bin/reset-cache

CMD [ "reset-cache" ]