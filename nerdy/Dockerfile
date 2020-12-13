FROM debian:bullseye-slim
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apt-get update && apt-get install -y \
	ca-certificates \
	cowsay \
	curl \
	figlet \
	imagemagick \
	jp2a \
	python \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV HOME /root
WORKDIR $HOME

COPY ./lolcat /usr/bin/lolcat
COPY ./clippy.cow /usr/share/cowsay/cows/clippy.cow

RUN echo 'image_me() { convert $1 jpg:- | jp2a ${*:2} -; }' >> $HOME/.bashrc
RUN echo 'figlet_lolcat() { figlet $1 | lolcat; }' >> $HOME/.bashrc

ENTRYPOINT [ "bash" ]
