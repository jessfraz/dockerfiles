FROM ruby:1.9.3-p547
MAINTAINER Jessica Frazelle <jess@docker.com>

# update gems
RUN gem update --system
RUN gem update

# install idonethis from git
COPY src/ /idonethis
RUN cd /idonethis; rake build; gem install /idonethis/pkg/idonethis-0.1.0.gem;

COPY .idonethisrc /
COPY main.sh /

ENTRYPOINT ["/main.sh"]