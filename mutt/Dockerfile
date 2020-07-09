# Run Mutt from a container

# docker run -it \
#	-v /etc/localtime:/etc/localtime:ro \
#	-e GMAIL -e GMAIL_NAME \ # pass env variables to config
#	-e GMAIL_PASS -e GMAIL_FROM \
#	-v $HOME/.gnupg:/home/user/.gnupg \ # so you can encrypt ;)
#	--name mutt \
#	jess/mutt
#
FROM alpine:latest
LABEL maintainer "Jeffrey Serio <serio.jeffrey@gmail.com>"

RUN addgroup -g 1000 user \
	&& adduser -D -h /home/user -G user -u 1000 user

RUN apk --no-cache add \
	ca-certificates \
	elinks \
	git \
	gnupg1 \
	lynx \
	mutt \
	mutt-doc \
	neovim \
    curl \
	--repository http://dl-cdn.alpinelinux.org/alpine/edge/main

# a browser is necessary!
ENV BROWSER lynx

USER user
ENV HOME /home/user
ENV TERM xterm-256color
RUN mkdir -p $HOME/.mutt/cache/headers $HOME/.mutt/cache/bodies \
	&& touch $HOME/.mutt/certificates

# nvim settings
RUN mkdir -p $HOME/.config/nvim \
    && wget https://gitlab.com/hyperreal42/chezmoi/-/raw/master/dot_config/nvim/init.vim -O $HOME/.config/nvim/init.vim \
    && sh -c 'curl -fLo "${XDG_DATA_HOME:-$HOME/.local/share}"/nvim/site/autoload/plug.vim --create-dirs \
       https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim'

ENV LANG C.UTF-8

COPY	entrypoint.sh	/entrypoint.sh
COPY	.mutt			$HOME/.mutt

ENTRYPOINT ["/entrypoint.sh"]

CMD ["mutt", "-F", "~/.mutt/muttrc"]
