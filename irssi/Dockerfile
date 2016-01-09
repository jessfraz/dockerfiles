FROM debian:jessie

RUN apt-get update && apt-get install -y --no-install-recommends \
		ca-certificates \
		curl \
		libdatetime-perl \
		libgcrypt20-dev \
		libglib2.0-0 \
		libnotify4 \
		libnotify-bin \
		libwww-perl \
		perl \
		wget \
	&& rm -rf /var/lib/apt/lists/*

ENV HOME /home/user
RUN useradd --create-home --home-dir $HOME user \
	&& mkdir -p $HOME/.irssi \
	&& chown -R user:user $HOME

ENV LANG C.UTF-8

# gpg: key DDBEF0E1: public key "The Irssi project <staff@irssi.org>" imported
RUN gpg --keyserver pool.sks-keyservers.net --recv-keys 7EE65E3082A5FB06AC7C368D00CCB587DDBEF0E1

ENV IRSSI_VERSION 0.8.17
ENV LIB_OTR_VERSION 4.1.0
ENV IRSSI_OTR_VERSION 1.0.0

RUN buildDeps=' \
		autoconf \
		automake \
		bzip2 \
		libglib2.0-dev \
		libncurses-dev \
		libperl-dev \
		libssl-dev \
		libtool \
		lynx \
		make \
		pkg-config \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& curl -fsSL "https://github.com/irssi-import/irssi/releases/download/${IRSSI_VERSION}/irssi-${IRSSI_VERSION}.tar.bz2" -o /tmp/irssi.tar.bz2 \
	&& curl -fsSL "https://github.com/irssi-import/irssi/releases/download/${IRSSI_VERSION}/irssi-${IRSSI_VERSION}.tar.bz2.sig" -o /tmp/irssi.tar.bz2.sig \
	&& gpg --verify /tmp/irssi.tar.bz2.sig \
	&& mkdir -p /usr/src/irssi \
	&& tar -xjf /tmp/irssi.tar.bz2 -C /usr/src/irssi --strip-components 1 \
	&& rm /tmp/irssi.tar.bz2* \
	&& cd /usr/src/irssi \
	&& ./configure \
		--enable-true-color \
		--prefix="/usr" \
		--with-bot \
		--with-proxy \
		--with-socks \
	&& make \
	&& make install \
	&& curl -sSL "https://otr.cypherpunks.ca/libotr-${LIB_OTR_VERSION}.tar.gz" -o /tmp/libotr.tar.gz \
	&& curl -sSL "https://otr.cypherpunks.ca/libotr-${LIB_OTR_VERSION}.tar.gz.asc" -o /tmp/libotr.tar.gz.asc \
	&& curl -sSL "https://otr.cypherpunks.ca/gpgkey.asc" | gpg --import \
	&& gpg --verify /tmp/libotr.tar.gz.asc \
	&& mkdir -p /usr/src/libotr \
	&& tar -xzf /tmp/libotr.tar.gz -C /usr/src/libotr --strip-components 1 \
	&& rm /tmp/libotr.tar.gz* \
	&& cd /usr/src/libotr \
	&& ./configure --with-pic --prefix=/usr \
	&& make \
	&& make install \
	&& mkdir -p /usr/src/irssi-otr \
	&& curl -sSL "https://github.com/cryptodotis/irssi-otr/archive/v${IRSSI_OTR_VERSION}.tar.gz" | tar -vxz --strip-components 1 -C /usr/src/irssi-otr \
	&& cd /usr/src/irssi-otr \
	&& ./bootstrap \
	&& ./configure --prefix="/usr" \
	&& make \
	&& make install \
	&& rm -rf /usr/src/irssi* \
	&& rm -rf /usr/src/libotr* \
	&& apt-get purge -y --auto-remove $buildDeps

WORKDIR $HOME

USER user
CMD ["irssi"]
