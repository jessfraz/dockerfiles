FROM haskell
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN cabal update && cabal install pandoc pandoc-citeproc

ENTRYPOINT [ "pandoc" ]
