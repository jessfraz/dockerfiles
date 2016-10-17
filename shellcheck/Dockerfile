FROM haskell
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	file \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN cabal update && cabal install shellcheck

CMD ["shellcheck"]
