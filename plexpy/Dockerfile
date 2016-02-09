# A Python based monitoring and tracking tool for Plex Media Server.
#
# docker run  -d \ 
#  --name=PlexPy \
#  -v <path to plexlogs>:/data/logs \
#  -p 8181:8181 \
#  arukaen/plexpy

FROM ubuntu:14.04
MAINTAINER  Cris G c@cristhekid.com
ENV DEBIAN_FRONTEND noninteractive

# Install required packages.
RUN \
  apt-get update && \
  apt-get install -yq git python && \
  rm -rf /var/lib/apt/lists/*

# Create Plexpy directory
RUN mkdir -p /opt/plexpy

# Clone the repo.
RUN git clone https://github.com/drzoidberg33/plexpy.git /opt/plexpy/

# Volume for Plexpy data.
VOLUME /data

# Set the working directory.
WORKDIR /opt/plexpy

# Define default command.
CMD ["python", "PlexPy.py", "--nolaunch", "--datadir=/data"]

# Expose ports.
EXPOSE 8181
