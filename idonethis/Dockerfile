FROM ruby:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

# update gems
RUN gem update --system \
	&& gem update \
	&& gem install syck

# install idonethis from git
RUN git clone https://github.com/influitive/idonethis.git /idonethis
RUN cd /idonethis; rake build; gem install /idonethis/pkg/idonethis-0.1.0.gem;

COPY .idonethisrc /root/.idonethisrc
COPY main.sh /main.sh

ENTRYPOINT ["/main.sh"]
