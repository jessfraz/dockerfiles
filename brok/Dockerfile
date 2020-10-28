FROM haskell:8.8

LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN cabal update && cabal install brok

CMD ["brok"]
