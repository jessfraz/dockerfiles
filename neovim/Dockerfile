# docker build -t vim-go . 
# docker run --rm -it vim-go 
# (optionally volume mount your own $GOPATH)
# docker run --rm -it -v $GOPATH:/go vim-go
FROM golang:alpine

RUN apk --no-cache add curl git python3 \
  && apk --no-cache add neovim --repository http://dl-3.alpinelinux.org/alpine/edge/testing/ \
  && apk add --no-cache --virtual .build-deps gcc musl-dev python3-dev \
  && pip3 install --no-cache-dir neovim \
  && apk del .build-deps

COPY vimrc /root/.vimrc

RUN mkdir -p ~/.config ~/.vim \
  && ln -s ~/.vim ~/.config/nvim \
  && ln -s ~/.vimrc ~/.config/nvim/init.vim

RUN nvim -c ':PlugInstall' \
         -c ':sleep 5' \
         >/dev/stdout || true

RUN nvim -c ':GoInstallBinaries' \
         -c ':sleep 5' \
         >/dev/stdout || true

ENV TERM=xterm-256color

ENTRYPOINT nvim
