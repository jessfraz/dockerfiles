FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
    gimp \
    --no-install-recommends

ENTRYPOINT [ "gimp" ]
