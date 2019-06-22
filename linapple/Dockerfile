FROM alpine:latest

RUN apk --no-cache add \
	ca-certificates \
	libcurl \
	libgcc \
	libstdc++ \
	libzip \
	sdl

RUN set -x \
	&& apk add --no-cache --virtual .build-deps \
		build-base \
		bzip2 \
		curl \
		curl-dev \
		libzip-dev \
		make \
		sdl-dev \
		tar \
	&& curl -sSL "https://beotiger.com/download/linapple_src-2b" -o /tmp/linapple.tar.bz2 \
	&& mkdir -p /usr/src/linapple \
	&& tar -xjf /tmp/linapple.tar.bz2 -C /usr/src/linapple --strip-components=1 \
	&& rm /tmp/linapple.tar.bz2 \
	&& ( \
		cd /usr/src/linapple/src \
		&& make \
		&& make install \
	) \
	&& apk del .build-deps

COPY Frogger.dsk /usr/src/games/
COPY quest1.dsk /usr/src/games/

ENTRYPOINT ["linapple"]
CMD ["-1", "/usr/src/games/quest1.dsk"]
