FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
    lynx \
    --no-install-recommends

ENTRYPOINT [ "lynx" ]
