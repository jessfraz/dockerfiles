# run tor in a container
#
# docker run -d \
#	--restart always \
#	-v /etc/localtime:/etc/localtime:ro \
#	-p 9040:22340 \
#	-p 5353:22353 \
# 	--name tor-router \
# 	jess/tor-router
#
FROM debian:sid
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	tor \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

EXPOSE 22340
EXPOSE 22350
EXPOSE 22353

# copy in our torrc file
COPY torrc.default /etc/tor/torrc.default

# make sure files are owned by tor user
RUN chown -R debian-tor:debian-tor /etc/tor/torrc.default

USER debian-tor

ENTRYPOINT [ "tor" ]
CMD [ "-f", "/etc/tor/torrc.default" ]
