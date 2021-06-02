# Run Lynx in a conatiner
#
# docker run --rm -it \
#	--name lynx \
#	jess/lynx github.com/jessfraz
#
FROM debian:bullseye-slim
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apt-get update && apt-get install -y \
	lynx \
	--no-install-recommends && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENTRYPOINT [ "lynx" ]
