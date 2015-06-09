FROM python:2.7.8
MAINTAINER Jessica Frazelle <jess@docker.com>

ENV HOME /home/gcalcli
RUN useradd --create-home --home-dir $HOME gcalcli \
	&& chown -R gcalcli:gcalcli $HOME

RUN pip install vobject parsedatetime gcalcli

WORKDIR $HOME
USER gcalcli

ENTRYPOINT [ "/usr/local/bin/gcalcli" ]
