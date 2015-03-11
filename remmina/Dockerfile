FROM ubuntu:14.10
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	software-properties-common \
	--no-install-recommends && \
	apt-add-repository ppa:remmina-ppa-team/remmina-next && \
	apt-get update && apt-get install -y \
	hicolor-icon-theme \
    remmina \
	remmina-plugin-rdp \
    --no-install-recommends

ENTRYPOINT [ "remmina" ]
