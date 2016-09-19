FROM ruby:alpine
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	libcurl3-dev \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& gem install cloudapp

ENTRYPOINT ["cloudapp"]
