# VERSION:		0.1
# DESCRIPTION:	Create a flask container
# AUTHOR:		Iulian Cucoanis <iulian.iln@gmail.com>
# USAGE:
#	# Build a flask image
#	docker build -t docker-flask .
#
#	# Run the container and start a web server on port 80
#	docker run -d -p 80:80 docker-flask /usr/sbin/apache2ctl -D FOREGROUND

FROM debian:jessie
MAINTAINER Iulian Cucoanis <iulian.iln@gmail.com>

# Copy the application archive in the /var/www/ directory
COPY FlaskApp.tar.gz /var/www/

# Install dependencies
RUN apt-get update && apt-get -y install \
	python-pip \
	apache2 \
	libapache2-mod-wsgi \ 
	&& rm /etc/apache2/sites-enabled/000-default.conf \
	&& rm -rf /var/lib/apt/lists/*

# Install Flask
RUN pip install Flask

# Copy our custom config file 
COPY 000-default.conf /etc/apache2/sites-enabled/

# Extract the contents from the archive and then remove it
RUN cd /var/www/ && tar xvf FlaskApp.tar.gz \
	&& rm FlaskApp.tar.gz
