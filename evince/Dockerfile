# Evince in a container
#
# docker run -it --rm \
#	-v $HOME/documents/:/home/user/documents \
#	-v /tmp/.X11-unix:/tmp/.X11-unix \
#	-e DISPLAY \
#	evince
#

FROM alpine:latest
LABEL maintainer "Christian Koep <christiankoep@gmail.com>"

RUN apk update && apk add shadow evince ttf-opensans

ENV HOME /home/user
RUN useradd --create-home --home-dir $HOME user \
	&& mkdir $HOME/documents && chown -R user:user $HOME

WORKDIR $HOME
USER user

CMD ["/usr/bin/evince"]
