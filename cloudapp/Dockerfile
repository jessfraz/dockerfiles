FROM ruby:1.9.3
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	libcurl3-dev \
	--no-install-recommends

# update gems
# and install cloudapp
RUN gem update --system \
	&& gem update \
	&& gem install gem-man cloudapp

ENTRYPOINT ["cloudapp"]
