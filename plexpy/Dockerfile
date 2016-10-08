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
  python

# Get the source
ENV PLEXPY_VERSION v1.4.12
RUN set -x \
	&& apk add --no-cache --virtual .build-deps \
		git \
	&& mkdir -p /opt/plexpy \
	&& git clone --branch "${PLEXPY_VERSION}" https://github.com/drzoidberg33/plexpy.git /opt/plexpy/ \
	&& apk del .build-deps

# Volume for Plexpy data.
VOLUME /data

# Set the working directory.
WORKDIR /opt/plexpy

# Expose ports.
EXPOSE 8181

# Define default command.
CMD ["python", "PlexPy.py"]
ENTRYPOINT ["--nolaunch", "--datadir=/data"]
