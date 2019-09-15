# Run weechat in a container
#
# docker run -it \
#	-v $HOME/.weechat/home/user/.weechat \
#	--name weechat \
#	jess/weechat
#

FROM alpine:latest

RUN apk add --no-cache \
	weechat

ENV HOME /home/user

RUN adduser -D user \
	&& chown -R user $HOME

WORKDIR $HOME
USER user

ENTRYPOINT [ "weechat" ]
