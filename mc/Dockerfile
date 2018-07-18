FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apk add --no-cache \
		glib \
		libintl \
		libssh2 \
		ncurses-libs

ENV MC_VERSION 4.8.21

RUN set -x \
	&& apk add --no-cache --virtual .build-deps \
		autoconf \
		automake \
		build-base \
		aspell-dev \
		e2fsprogs-dev \
		gettext-dev \
		git \
		glib-dev \
		libssh2-dev \
		libtool \
		ncurses-dev \
		pcre-dev \
	&& git clone --depth 1 --branch "$MC_VERSION" https://github.com/MidnightCommander/mc.git /usr/src/mc \
	&& ( \
		cd /usr/src/mc \
		&& ./autogen.sh \
		&& ./configure \
			--prefix=/usr \
			--libexecdir=/usr/lib \
			--mandir=/usr/share/man \
			--sysconfdir=/etc \
			--enable-background \
			--enable-charset \
			--enable-largefile \
			--enable-vfs-sftp \
			--with-internal-edit \
			--with-mmap \
			--with-screen=ncurses \
			--with-subshell \
			--without-gpm-mouse \
			--without-included-gettext \
			--without-x \
			--enable-aspell \
		&& make \
		&& make install \
	) \
	&& rm -rf /usr/src/mc \
	&& apk del .build-deps

ENTRYPOINT [ "mc" ]
