FROM debian:jessie

RUN groupadd -g 1000 user \
	&& useradd --create-home -d /home/user -g user -u 1000 user

RUN apt-get update && apt-get install -y \
    ca-certificates \
    git \
    lynx \
    mutt-patched \
    vim-nox \
    --no-install-recommends 

ENV BROWSER lynx
ENV TERM xterm-256color

ENV HOME /home/user
USER user

RUN mkdir -p $HOME/.mutt/cache/headers $HOME/.mutt/cache/bodies \
	&& touch $HOME/.mutt/certificates \
    && git clone https://github.com/jfrazelle/.vim.git $HOME/.vim \
    && git clone https://github.com/altercation/vim-colors-solarized $HOME/.vim/bundle/vim-colors-solarized \
    && cp $HOME/.vim/vimrc.txt $HOME/.vimrc

ENV LANG C.UTF-8

COPY . $HOME/

ENTRYPOINT ["/home/user/entrypoint.sh"]
CMD ["mutt-patched"]
