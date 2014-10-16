FROM ruby:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

# update gems
RUN gem update --system
RUN gem update

# install cloudapp
RUN gem install gem-man
RUN gem install cloudapp

ENTRYPOINT ["cloudapp"]
