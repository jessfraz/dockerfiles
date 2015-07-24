FROM debian:sid
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	imagemagick \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

CMD [ "echo", "Use one of the following commands [ animate | compare | composite | conjure | convert | display | identify | import | mogrify | montage | stream ]" ]
