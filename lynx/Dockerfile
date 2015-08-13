# Run Lynx in a conatiner 
#
# docker run --rm -it \
#	--name lynx \
#	jess/lynx github.com/jfrazelle
#
FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apk update && apk add \
	lynx \
	&& rm -rf /var/cache/apk/*

ENTRYPOINT ["lynx"]
