# Run imagemin in a container:
#
# docker run --rm -it \
#	-v /etc/localtime:/etc/localtime:ro \
#	-v $HOME/Pictures:/root/Pictures \
#	--entrypoint bash \
#	jess/imagemin
#
FROM alpine
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apk update && apk add \
	autoconf \
	automake \
	build-base \
	file \
	libpng-dev \
	nasm \
	nodejs \
	&& rm -rf /var/cache/apk/* \
	&& npm install --global imagemin

CMD [ "imagemin", "--help" ]
