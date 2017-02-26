FROM alpine:latest

COPY ./.zshrc /root/.zshrc

RUN apk --no-cache add \
	shadow \
	zsh \
	&& chsh -s /bin/zsh

ENV SHELL /usr/bin/zsh

WORKDIR /root
ENTRYPOINT /bin/zsh
