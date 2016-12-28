# A Python based monitoring and tracking tool for Plex Media Server.
#
# docker run  -d \
#  --name=PlexPy \
#  -v <path to local plexpy data>:/data \
#  -p 8181:8181 \
#  r.j3ss.co/plexpy
FROM alpine:latest

# Install required packages.
RUN apk add --no-cache \
	ca-certificates \
	git \
	python

# Get the source
ENV PLEXPY_VERSION v1.4.16
RUN git clone https://github.com/drzoidberg33/plexpy.git /opt/plexpy \
	&& ( \
		cd /opt/plexpy \
		&& git checkout "${PLEXPY_VERSION}" \
	)

# Volume for Plexpy data.
VOLUME /data

# Set the working directory.
WORKDIR /opt/plexpy

# Expose ports.
EXPOSE 8181

# Define default command.
ENTRYPOINT ["python", "PlexPy.py"]
CMD ["--nolaunch", "--datadir=/data"]
