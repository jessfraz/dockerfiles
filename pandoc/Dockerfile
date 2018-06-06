FROM haskell
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN buildDeps=' \
		unzip \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& cabal update \
	&& cabal install pandoc pandoc-citeproc  \
	&& apt-get purge -y --auto-remove $buildDeps

ENTRYPOINT [ "pandoc" ]
