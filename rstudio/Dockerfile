# Run RStudio in a container
#
# docker run -it \
#	-v /tmp/.X11-unix:/tmp/.X11-unix \ # mount the X11 socket
#	-e DISPLAY=unix$DISPLAY \
#	-v $HOME/rscripts:/root/rscripts \
#	--device /dev/dri \
#	--name rstudio \
#	jess/rsudio
#

# Base docker image
FROM debian:sid
MAINTAINER Jessica Frazelle <jess@docker.com>

ADD https://download1.rstudio.org/rstudio-0.99.484-amd64.deb /src/rstudio.deb

# Install Rstudio
RUN apt-get update && apt-get install -y \
	libedit2 \
	libgl1-mesa-dri \
	libgl1-mesa-glx \
	libgstreamer0.10-0 \
	libgstreamer-plugins-base0.10-0 \
	libjpeg-dev \
	libjpeg62-turbo \
	libjpeg62-turbo-dev \
	libqt5core5a \
	libqt5dbus5 \
	libqt5gui5 \
	libqt5network5 \
	libqt5printsupport5 \
	libqt5webkit5 \
	libqt5widgets5 \
	libtiff5 \
	libxcomposite1 \
	libxslt1.1 \
	r-base \
	r-base-core \
	r-base-dev \
	r-recommended \
	--no-install-recommends && \
	dpkg -i '/src/rstudio.deb' \
	&& apt-get install -fy \
	&& rm -rf /var/lib/apt/lists/* \
	&& rm -rf /src/*.deb \
	&&  ln -f -s /usr/lib/rstudio/bin/rstudio /usr/bin/rstudio

# Set default CRAN repo
RUN echo 'options(repos = c(CRAN = "https://cran.rstudio.com/"), download.file.method = "libcurl")' >> /etc/R/Rprofile.site

# Autorun Rstudio
ENTRYPOINT [ "rstudio" ]
