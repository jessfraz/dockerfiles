FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN sed -i.bak 's/jessie main/jessie main contrib/g' /etc/apt/sources.list && \
    apt-get update && apt-get install -y \
    flashplugin-nonfree \
    iceweasel \
    --no-install-recommends

ENTRYPOINT [ "iceweasel" ]
