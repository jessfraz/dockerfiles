FROM debian:stretch
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	python-fontforge \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN buildDeps=' \
				ca-certificates \
                git \
        ' \
        set -x \
        && apt-get update \
        && apt-get install -y $buildDeps --no-install-recommends \
        && git clone -b develop --depth 1 https://github.com/Lokaltog/vim-powerline.git /pwrline \
		&& ( \
        cd /pwrline \
		&& mv fontpatcher/fontpatcher /usr/bin/ \
		&& mv fontpatcher/PowerlineSymbols.sfd /usr/bin/ \
		) \
        && rm -rf /pwrline \
        && echo "Build complete."

ENTRYPOINT [ "fontpatcher" ]
