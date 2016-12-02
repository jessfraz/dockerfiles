# Run tor messenger in a container
#
# docker run -d \
#	-v /tmp/.X11-unix:/tmp/.X11-unix \
#	-e DISPLAY=unix$DISPLAY \
#	jess/tor-messenger
#
FROM debian:stretch
MAINTAINER Christian Koep <christian.koep@fom-net.de>

ENV HOME /home/user
ENV LANG C.UTF-8
ENV TOR_VERSION 0.3.0b1
ENV TOR_FINGERPRINT 0xB01C8B006DA77FAA

RUN apt-get update && apt-get -y install \
	ca-certificates \
	curl \
	dirmngr \
	gnupg \
	gxmessage \
	libasound2 \
	libdbus-glib-1-2 \
	libgtk2.0-0 \
	libxt6 \
	tar \
	xz-utils \
	zenity \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --home-dir $HOME user && chown -R user:user $HOME

RUN cd /tmp && \
	curl -sSOL https://dist.torproject.org/tormessenger/${TOR_VERSION}/tor-messenger-linux64-${TOR_VERSION}_en-US.tar.xz && \
	curl -sSOL https://dist.torproject.org/tormessenger/${TOR_VERSION}/sha256sums-unsigned-build.txt && \
	curl -sSOL https://dist.torproject.org/tormessenger/${TOR_VERSION}/sha256sums-unsigned-build.txt.asc && \
	mkdir ~/.gnupg && \
	gpg --no-tty --keyserver pgp.mit.edu --recv-keys ${TOR_FINGERPRINT} || \
	gpg --fingerprint --keyid-format LONG ${TOR_FINGERPRINT} | grep "Key fingerprint = E4AC D397 5427 A5BA 8450   A1BE B01C 8B00 6DA7 7FAA" && \
	gpg --verify sha256sums-unsigned-build.txt.asc && \
	grep $(sha256sum tor-messenger-linux64-${TOR_VERSION}_en-US.tar.xz) sha256sums-unsigned-build.txt && \
	tar xfv tor-messenger-linux64-${TOR_VERSION}_en-US.tar.xz -C /usr/local/bin && \
	rm -rf tor-messenger*	&& \
	chown -R user.user /usr/local/bin/tor-messenger && \
	rm -rf ~/.gnupg && \
	rm -rf /tmp

WORKDIR $HOME

USER user

CMD ["/usr/local/bin/tor-messenger/Browser/start-tor-messenger", "--verbose"]
