FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apk --no-cache add \
	--repository https://dl-3.alpinelinux.org/alpine/edge/testing/ \
	gnuplot

ENTRYPOINT ["gnuplot"]
