# Run weechat in a container
#
# docker run -it \
#	-v $HOME/.weechat/home/me/.weechat \
#	--name weechat \
#	tsanov/weechat
#

FROM alpine:latest

RUN apk add --no-cache weechat
RUN apk add --no-cache weechat-perl
RUN apk add --no-cache weechat-python
RUN apk add --no-cache python3

ARG RUNTIME_UID
ENV RUNTIME_UID ${UID:-1000}
ENV HOME /home/me

RUN adduser -D me -u ${RUNTIME_UID} \
	&& chown -R me $HOME

WORKDIR $HOME
USER me

ENTRYPOINT [ "weechat" ]
