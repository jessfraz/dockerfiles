# Run imagemin in a container:
#
# docker run --rm -it \
#	-v /etc/localtime:/etc/localtime:ro \
#	-v $HOME/Pictures:/root/Pictures \
#	--entrypoint bash \
#	jess/imagemin
#
FROM alpine:latest
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apk --no-cache add \
	autoconf \
	automake \
	build-base \
	file \
	libpng-dev \
	nasm \
	nodejs \
	&& npm install --global imagemin-cli

CMD [ "imagemin", "--help" ]
