# DESCRIPTION:	Create sublime-text 3 container with its dependencies (https://www.sublimetext.com/3)
# AUTHORS:		Christian Koep <christian.koep@fom-net.de>, Chuck Knox <charles.m.knox@gmail.com>
# USAGE:
#	# Build sublime-text 3 image
#	docker build -t sublime-text:3 .
#
#	# Run the container and mount the local settings and your code
#   # Your code must be under $HOME/Documents, you only need to change it here.
#		docker run -d -it \
#			-w $HOME/Documents \
#			-v $HOME/.config/sublime-text-3:$HOME/.config/sublime-text-3 \
#			-v $HOME/Documents:$HOME/Documents \
#			-v /tmp/.X11-unix:/tmp/.X11-unix \
#			-v $HOME/.local/share/recently-used.xbel:$HOME/.local/share/recently-used.xbel \
#			-e DISPLAY=$DISPLAY \
#			-e NEWUSER=$USER \
#			-e LANG=en_US.UTF-8 \
#			sublime-text:3
#
# POSSIBLE ISSUES:
#	# 'Gtk: cannot open display: :0'
#	Try to set 'DISPLAY=your_host_ip:0' or run 'xhost +' on your host.
#	(see: https://stackoverflow.com/questions/28392949/running-chromium-inside-docker-gtk-cannot-open-display-0)
#

FROM debian:stretch
MAINTAINER Christian Koep <christian.koep@fom-net.de>

# Installing the libcanberra-gtk-module gets rid of a lot of annoying error messages.
RUN apt-get update && apt-get -y install \
	locales \
	libcanberra-gtk-module \
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

ENV SUBLIME_VERSION build_3126

RUN curl -sSL "https://download.sublimetext.com/sublime_text_3_${SUBLIME_VERSION}_x64.tar.bz2" -o /tmp/sublime.tar.bz2 \
	&& mkdir -p /usr/src/sublime_text \
	&& tar -xjf /tmp/sublime.tar.bz2 -C /usr/src/sublime_text --strip-components 1 \
	&& rm /tmp/sublime.tar.bz2*

# Generate system-wide UTF-8 locale
# Sublime might nag about Ascii issue w/ Package Control otherwise
RUN echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && \
	locale-gen && \
	echo "LANG=en_US.UTF-8" > /etc/locale.conf

# In order to prevent writing as root:root in Sublime, we have to run the Sublime Text container
# as the user that creates the container. Normally we do this by passing $UID.
# But just passing $UID along isn't enough - Sublime has to be started by a user that exists.
# By default in the container, the only user that actually exists is root.
# Therefore we have to create a new user, and start Sublime as that user.
# This is not possible at build time, so the /run.sh script accepts an environment
# variable called $NEWUSER that creates a user and group named $USER.
# Additional note: Sublime puts a lot of stuff in ~/.config, which is mounted at runtime. Without this directory being mounted, settings/packages/etc won't persist.
COPY run.sh /run.sh
RUN chmod +x /run.sh

CMD ["/run.sh"]
