# VERSION:		0.1
# DESCRIPTION:	Create sublime-text 3 container with its dependencies (https://www.sublimetext.com/3)
# AUTHOR:		Christian Koep <christian.koep@fom-net.de>
# USAGE:
#	# Build sublime-text 3 image
#	docker build -t sublime-text:3 .
#
#	# Run the container and mount the local settings and your code
#	docker run -it \
#		-v $HOME/.config/sublime-text-3/:/root/.config/sublime-text-3 \
#		-v $HOME/development:/root/development \
#		-v /tmp/.X11-unix:/tmp/.X11-unix \
#		-e DISPLAY=$DISPLAY sublime-text:3
#
# POSSIBLE ISSUES:
#	# 'Gtk: cannot open display: :0'
#	Try to set 'DISPLAY=your_host_ip:0' or run 'xhost +' on your host.
#	(see: http://stackoverflow.com/questions/28392949/running-chromium-inside-docker-gtk-cannot-open-display-0)
#

FROM debian:jessie
MAINTAINER Christian Koep <christian.koep@fom-net.de>

RUN apt-get update && apt-get -y install \
	ca-certificates \
	curl \
	tar \
	bzip2 \
	libglib2.0-0 \
	libx11-6 \
	libcairo2 \
	libpango-1.0-0 \
	libpangocairo-1.0-0 \
	libgtk2.0-0 \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN curl -sSL "https://download.sublimetext.com/sublime_text_3_build_3114_x64.tar.bz2" -o /tmp/sublime.tar.bz2 \
	&& mkdir -p /usr/src/sublime_text \
	&& tar -xjf /tmp/sublime.tar.bz2 -C /usr/src/sublime_text --strip-components 1 \
	&& rm /tmp/sublime.tar.bz2*

CMD ["/usr/src/sublime_text/sublime_text", "-w"]
