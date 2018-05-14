# Run firefox in a container
#
# docker run -d \
#	--net=host \
#	-e DISPLAY \
#	-v $HOME/.Xauthority:/root/.Xauthority \
#	--name firefox \
#	firefox
#
# Above the most basic way to run the container, you'll probably want use volumes to keep date, --device /dev/snd for sound, ...

FROM debian:sid
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apt-get update && apt-get install -y \
	dirmngr \
	gnupg \
	--no-install-recommends \
	&& apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 0AB215679C571D1C8325275B9BDB3D89CE49EC21 \
	&& echo "deb http://ppa.launchpad.net/mozillateam/firefox-next/ubuntu xenial main" >> /etc/apt/sources.list.d/firefox.list \
	&& apt-get update && apt-get install -y \
	ca-certificates \
	firefox \
	hicolor-icon-theme \
	libasound2 \
	libgl1-mesa-dri \
	libgl1-mesa-glx \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV LANG en-US

#Creates a default profile where browser.tabs.remote.autostart is turned off.
#This fixes tabs crashing in certain cases (e.g. playing youtube movies).
RUN mkdir -p /root/.mozilla/firefox/abcdefgh.default
RUN echo 'user_pref("browser.tabs.remote.autostart", false);' > /root/.mozilla/firefox/abcdefgh.default/user.js
RUN echo '[General]\n\
StartWithLastProfile=1\n\
[Profile0]\n\
Name=Default User\n\
IsRelative=1\n\
Path=abcdefgh.default\n\
' > /root/.mozilla/firefox/profiles.ini

COPY local.conf /etc/fonts/local.conf

ENTRYPOINT [ "/usr/bin/firefox" ]
