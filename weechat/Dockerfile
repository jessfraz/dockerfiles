FROM alpine:latest

RUN apk add --no-cache \
	weechat

ENV HOME /home/user

RUN adduser -S user \
	&& chown -R user $HOME

WORKDIR $HOME
USER user

ENTRYPOINT [ "weechat" ]
