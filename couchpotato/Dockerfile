# Couchpotato in a container
#
# docker run -d \
# 	--restart always \
#	-p 5050:5050 \
# 	-v /etc/localtime:/etc/localtime:ro \
# 	-v /volumes/couchpotato:/data \
#	--link transmission:transmission \
# 	--name couchpotato \
# 	jess/couchpotato
#
FROM debian:sid
MAINTAINER Jessie Frazelle <jess@linux.com>


RUN apt-get update && apt-get install -y \
	ca-certificates \
	git \
	python \
	python-lxml \
	python-openssl \
	&& rm -rf /var/lib/apt/lists/*

EXPOSE 5050

RUN git clone https://github.com/RuudBurger/CouchPotatoServer.git /usr/src/couchpotato

WORKDIR /usr/src/couchpotato

ENTRYPOINT [ "python", "CouchPotato.py", "--debug" ]
CMD [ "--data_dir", "/data" ]
