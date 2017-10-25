FROM debian:sid
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apt-get update && apt-get install -y \
	ca-certificates \
	gcc \
	git \
	make \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN	git clone --depth 1 https://github.com/01org/lkp-tests.git /usr/src/lkp-tests

WORKDIR /usr/src/lkp-tests

RUN make install \
	&& lkp install

COPY run.sh /usr/local/bin/run-hackbench

CMD [ "lkp" ]
