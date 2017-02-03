# Run tor browser in a container
#
# docker run -v /tmp/.X11-unix:/tmp/.X11-unix \
#	-v /dev/snd:/dev/snd \
#	-e DISPLAY=unix$DISPLAY \
#	tor-browser
#
FROM debian:stretch
MAINTAINER Christian Koep <christian.koep@fom-net.de>

RUN apt-get update && apt-get install -y \
	ca-certificates \
	curl \
	dirmngr \
	gnupg \
	libasound2 \
	libdbus-glib-1-2 \
	libgtk2.0-0 \
	libxrender1 \
	libxt6 \
	xz-utils \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV HOME /home/user
RUN useradd --create-home --home-dir $HOME user \
	&& chown -R user:user $HOME

ENV LANG C.UTF-8

ENV TOR_VERSION 7.0a1-hardened
ENV TOR_FINGERPRINT 0x4E2C6E8793298290

# download tor and check signature
RUN cd /tmp \
	&& curl -sSOL "https://dist.torproject.org/torbrowser/${TOR_VERSION}/tor-browser-linux64-${TOR_VERSION}_ALL.tar.xz" \
	&& curl -sSOL "https://dist.torproject.org/torbrowser/${TOR_VERSION}/tor-browser-linux64-${TOR_VERSION}_ALL.tar.xz.asc" \
	&& mkdir ~/.gnupg \
	&& gpg --no-tty --keyserver "hkp://pool.sks-keyservers.net" --recv-keys ${TOR_FINGERPRINT} \
	&& gpg --fingerprint --keyid-format LONG ${TOR_FINGERPRINT} | grep "Key fingerprint = EF6E 286D DA85 EA2A 4BA7  DE68 4E2C 6E87 9329 8290" \
	&& gpg --verify tor-browser-linux64-${TOR_VERSION}_ALL.tar.xz.asc \
	&& tar -vxJ --strip-components 1 -C /usr/local/bin -f tor-browser-linux64-${TOR_VERSION}_ALL.tar.xz \
	&& rm -rf tor-browser* \
	&& rm -rf ~/.gnupg


# good fonts
COPY local.conf /etc/fonts/local.conf

WORKDIR $HOME
USER user

ENTRYPOINT ["/bin/bash"]
CMD [ "/usr/local/bin/Browser/start-tor-browser" ]
