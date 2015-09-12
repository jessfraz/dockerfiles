FROM debian:wheezy
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	ca-certificates \
	python-boto \
	--no-install-recommends \ 
	&& rm -rf /var/lib/apt/lists/*

COPY ./reset-cache.py /bin/reset-cache.py

CMD [ "/usr/bin/python", "/bin/reset-cache.py" ]
