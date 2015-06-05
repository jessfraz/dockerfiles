# VERSION: 0.1
# DESCRIPTION: Create sublime-text 3 container with its dependencies (https://www.sublimetext.com/3)
# AUTHOR: Christian Koep <christian.koep@fom-net.de>
# USAGE:
#	# Build sublime-text 3 image
#	docker build -t sublime-text:3 .
#
#	# Run the container and mount the local settings and your code
#	docker run -it \
#			   -v $HOME/.config/sublime-text-3/:/root/.config/sublime-text-3 \
#			   -v $HOME/development:/root/development \
#			   -v /tmp/.X11-unix:/tmp/.X11-unix \
#			   -e DISPLAY=$DISPLAY sublime-text:3
#
# POSSIBLE ISSUES:
#	# 'Gtk: cannot open display: :0'
#	Try to set 'DISPLAY=your_host_ip:0' or run 'xhost +' on your host.
#	(see: http://stackoverflow.com/questions/28392949/running-chromium-inside-docker-gtk-cannot-open-display-0)
#

FROM debian:jessie
MAINTAINER Christian Koep <christian.koep@fom-net.de>
RUN apt-get update && apt-get -y install \
	wget \
	tar \
	bzip2 \
	libglib2.0-0 \
	libx11-6 \
	libcairo2 \
	libpango-1.0-0 \
	libpangocairo-1.0-0 \
	libgtk2.0-0
RUN wget -q http://c758482.r82.cf2.rackcdn.com/sublime_text_3_build_3083_x64.tar.bz2 -O /usr/src/sublime.tar.bz2 && \
	cd /usr/src && \
	tar -xjf /usr/src/sublime.tar.bz2 && \
	rm -f /usr/src/sublime.tar.bz2
CMD ["/usr/src/sublime_text_3/sublime_text", "-w"]
