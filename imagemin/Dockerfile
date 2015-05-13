# Run imagemin in a container:
#
# docker run --rm -it \
#   -v /etc/localtime:/etc/localtime:ro \
#   -v $HOME/Pictures:/root/Pictures \
#   --entrypoint bash \
#   jess/imagemin
#
FROM node
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN npm install --global imagemin

ENTRYPOINT [ "imagemin" ]
CMD [ "--help" ]
