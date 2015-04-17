FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
    ulimit \
    --no-install-recommends

ENTRYPOINT [ "ulimit" ]
CMD [ "-n" ]
