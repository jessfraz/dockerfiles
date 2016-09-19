# Sickbeard in a container
#
# docker run -d \
# 	--restart always \
#	-p 8081:8081 \
# 	-v /etc/localtime:/etc/localtime:ro \
# 	-v /volumes/sickbeard:/data \
#	--link transmission:transmission \
# 	--name sickbeard \
# 	jess/sickbeard
#
FROM debian:sid
MAINTAINER Jessie Frazelle <jess@linux.com>


RUN apt-get update && apt-get install -y \
	ca-certificates \
	git \
	python-cheetah \
	python-setuptools \
	&& rm -rf /var/lib/apt/lists/*


ENV SICKBEARD_VERSION torrent_1080_subtitles

EXPOSE 8081

RUN git clone https://github.com/junalmeida/Sick-Beard.git /usr/src/sickbeard

WORKDIR /usr/src/sickbeard

ENTRYPOINT [ "python", "SickBeard.py" ]
CMD [ "--datadir", "/data" ]
