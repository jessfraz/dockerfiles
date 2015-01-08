FROM debian:stable

RUN groupadd -g 1000 user \
	&& useradd --create-home -d /home/user -g user -u 1000 user

RUN apt-get update && apt-get install -y \
    ca-certificates \
    git \
    mutt-patched

# a browser is necessary!
RUN apt-get update && apt-get install -y lynx
ENV BROWSER lynx

# my preferred editor :) (see also muttrc)
RUN apt-get update && apt-get install -y vim-nox

USER user
ENV HOME /home/user
ENV TERM xterm-256color
RUN mkdir -p $HOME/.mutt/cache/headers $HOME/.mutt/cache/bodies \
	&& touch $HOME/.mutt/certificates

# vim settings
RUN git clone https://github.com/jfrazelle/.vim.git $HOME/.vim \
    && git clone https://github.com/altercation/vim-colors-solarized $HOME/.vim/bundle/vim-colors-solarized \
    && cp $HOME/.vim/vimrc.txt $HOME/.vimrc

ENV LANG C.UTF-8

COPY    entrypoint.sh   /entrypoint.sh
COPY    .mutt           $HOME/.mutt

ENTRYPOINT ["/entrypoint.sh"]

CMD ["mutt-patched", "-F", "~/.mutt/muttrc"]
