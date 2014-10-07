FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
    stress \
    --no-install-recommends

ENTRYPOINT [ "stress" ]
