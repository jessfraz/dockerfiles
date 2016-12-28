# A Python based monitoring and tracking tool for Plex Media Server.
#
# docker run  -d \
#  --name=PlexPy \
#  -v <path to plexlogs>:/data/logs \
#  -p 8181:8181 \
#  arukaen/plexpy

FROM alpine:latest
MAINTAINER  Cris G c@cristhekid.com

# Install required packages.
RUN apk add --no-cache \
	ca-certificates \
	python

# Get the source
ENV PLEXPY_VERSION v1.4.16
RUN set -x \
	&& apk add --no-cache --virtual .build-deps \
		git \
	&& mkdir -p /opt/plexpy \
	&& git clone --depth 1 --branch "${PLEXPY_VERSION}" https://github.com/drzoidberg33/plexpy.git /opt/plexpy/ \
	&& apk del .build-deps

# Volume for Plexpy data.
VOLUME /data

# Set the working directory.
WORKDIR /opt/plexpy

# Expose ports.
EXPOSE 8181

# Define default command.
ENTRYPOINT ["python", "PlexPy.py"]
CMD ["--nolaunch", "--datadir=/data"]
