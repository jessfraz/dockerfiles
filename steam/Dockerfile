# Steam in a container
#
# WARNING: you cannot use this unless
# your graphics libs are the exact same version as the ones
# in the container, so don't even try
# or email me or any of the nonsense. if you really
# want to run this you have to use your brain. 
# I will not hold your hand.
FROM debian:sid

RUN sed -i.bak 's/sid main/sid main contrib non-free/g' /etc/apt/sources.list \
	&& dpkg --add-architecture i386 \
	&& apt-get update && apt-get install -y --fix-missing \
	binutils \
	libc6:i386 \
	libgl1-mesa-dri:i386 \
	libgl1-mesa-glx:i386 \
	sudo \
	steam \
	wget 

ENV HOME /home/steam

# let's head off a few of the things steam will want to install immediately
RUN adduser --disabled-password --gecos 'Steam' steam \
	&& usermod -aG video,audio steam \
	&& cd /tmp \
	&& wget http://snapshot.debian.org/archive/debian/20140810T163814Z/pool/main/libd/libdrm/libdrm-intel1_2.4.56-1_i386.deb \
	&& wget http://snapshot.debian.org/archive/debian/20140810T163814Z/pool/main/libd/libdrm/libdrm-intel1_2.4.56-1_amd64.deb \
	&& ar p libdrm-intel1_2.4.56-1_i386.deb data.tar.xz | tar xvJ \
	&& cp -r ./usr/lib/i386-linux-gnu/* /usr/lib/i386-linux-gnu/ \
	&& cp -r ./usr/lib/i386-linux-gnu/* $HOME/.steam/ubuntu12_32/steam-runtime/i386/ \
	&& ar p libdrm-intel1_2.4.56-1_amd64.deb data.tar.xz | tar xvJ \
	&& cp -r ./usr/lib/x86_64-linux-gnu/* /usr/lib/x86_64-linux-gnu/ \
	&& cp -r ./usr/lib/x86_64-linux-gnu/* $HOME/.steam/ubuntu12_64/ 

USER steam

CMD ["steam"]
