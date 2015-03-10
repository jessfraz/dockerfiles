FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	libgssapi-krb5-2 \
    rdesktop \
    --no-install-recommends

ENTRYPOINT [ "rdesktop" ]
