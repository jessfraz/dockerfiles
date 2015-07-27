FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apk update && apk add \
	imagemagick \
	&& rm -rf /var/cache/apk/*

CMD [ "echo", "Use one of the following commands [ animate | compare | composite | conjure | convert | display | identify | import | mogrify | montage | stream ]" ]
