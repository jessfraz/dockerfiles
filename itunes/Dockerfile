# Run itunes windows app in a container with wine
#
# docker run --rm -it \
#	-v /etc/localtime:/etc/localtime:ro \
#	--cpuset-cpus 0 \
#	-v /tmp/.X11-unix:/tmp/.X11-unix  \
#	-e DISPLAY=unix$DISPLAY \
#	--device /dev/snd:/dev/snd \
#	--name itunes \
#	jess/itunes bash
#
FROM jess/wine
MAINTAINER Jessie Frazelle <jess@linux.com>

ADD https://jesss.s3.amazonaws.com/binaries/iTunesSetup.exe /usr/src/iTunesSetup.exe

RUN echo "wine /usr/src/iTunesSetup.exe" > /root/.bash_history

CMD [ "bash" ]
