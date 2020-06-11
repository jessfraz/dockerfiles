# Run gnuplot in a container

# docker run -d \
#	-v /tmp/.X11-unix:/tmp/.X11-unix \
#	-e DISPLAY=unix$DISPLAY \
#       -v $HOME/.Xauthority:/root/.Xauthority \
#       --hostname $(hostname) \
#	--name gnuplot \
#	jess/gnuplot
#

FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apk --no-cache add \
	--repository http://dl-cdn.alpinelinux.org/alpine/edge/testing/ \
	gnuplot

ENTRYPOINT ["gnuplot"]
