FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && apt-get install -y \
    mailman \
    --no-install-recommends

ENTRYPOINT [ "mailman" ]
