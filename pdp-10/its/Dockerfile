FROM debian:bullseye-slim

RUN apt-get update && apt-get install -y \
	ca-certificates \
	simh \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN buildDeps=' \
		expect \
		gcc \
		git \
		libc6-dev \
		make \
		libncurses5-dev \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& git clone --depth 1 "https://github.com/PDP-10/its.git" /usr/src/its \
	&& ( \
		cd /usr/src/its \
		&& make EMULATOR=simh \
	) \
	&& apt-get purge -y --auto-remove $buildDeps

WORKDIR /usr/src/its

ENTRYPOINT ["./start"]
