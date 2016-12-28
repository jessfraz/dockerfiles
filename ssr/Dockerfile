# DESCRIPTION:	  Create SimpleScreenRecorder in a container
# AUTHOR:		  Jessie Frazelle <jess@linux.com>
# COMMENTS:
#	This file describes how to build SimpleScreenRecoder
#	in a container with all dependencies installed.
#	Tested on Debian Jessie.
# USAGE:
#	# Download ssr Dockerfile
#	wget https://raw.githubusercontent.com/jessfraz/dockerfiles/master/ssr/Dockerfile
#
#	# Build ssr image
#	docker build -t ssr .
#
#	docker run -v /tmp/.X11-unix:/tmp/.X11-unix \
#		-e DISPLAY=unix$DISPLAY ssr
#

# Base docker image
FROM debian:stretch
MAINTAINER Jessie Frazelle <jess@linux.com>

# Install dependencies
RUN dpkg --add-architecture i386 && apt-get update && apt-get install -y \
	build-essential \
	ca-certificates \
	git \
	pkg-config \
	qt4-qmake \
	libqt4-dev \
	libavformat-dev \
	libavcodec-dev \
	libavutil-dev \
	libswscale-dev \
	libasound2-dev \
	libpulse-dev \
	libjack-jackd2-dev \
	libgl1-mesa-dev \
	libglu1-mesa-dev \
	libx11-dev \
	libxfixes-dev \
	libxext-dev \
	libxi-dev \
	g++-multilib \
	libx11-6 \
	libxext6 \
	libxfixes3 \
	libxfixes3:i386 \
	libglu1-mesa:i386 \
	sudo \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

# make adjustments
RUN cd /usr/lib/i386-linux-gnu && \
	ln -s libGL.so.1 libGL.so && \
	ln -s libGLU.so.1 libGLU.so && \
	ln -s libX11.so.6 libX11.so && \
	ln -s libXext.so.6 libXext.so && \
	ln -s libXfixes.so.3 libXfixes.so && \
	ldconfig

# add user
#RUN adduser --system --home=/src --shell=/bin/sh --no-create-home \
   # --group ssr

# clone source
RUN git clone --depth 1 https://github.com/MaartenBaert/ssr.git /src

# install
#RUN echo "ssr ALL = NOPASSWD: /src/simple-build-and-install" >> /etc/sudoers
RUN sed -i".bak" '10,13d' /src/simple-build-and-install
RUN sed -i".bak" '13,14d' /src/postinstall
RUN cd /src && \
	#chown -R ssr /src && \
	#sudo -u ssr
	/src/simple-build-and-install

# Autorun ssr
CMD ["/usr/bin/simplescreenrecorder"]
