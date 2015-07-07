FROM haskell
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN cabal update && cabal install pandoc pandoc-citeproc

ENTRYPOINT [ "pandoc" ]
