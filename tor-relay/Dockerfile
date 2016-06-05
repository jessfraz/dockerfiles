# run a tor relay in a container
#
# Bridge relay:
#	docker run -d \
#		--restart always \
#		-v /etc/localtime:/etc/localtime:ro \
#		-p 9001:9001 \
# 		--name tor-relay \
# 		jess/tor-relay -f /etc/tor/torrc.bridge
#
# Exit relay:
# 	docker run -d \
#		--restart always \
#		-v /etc/localtime:/etc/localtime:ro \
#		-p 9001:9001 \
# 		--name tor-relay \
# 		jess/tor-relay -f /etc/tor/torrc.exit
#
FROM alpine:latest
MAINTAINER Jessica Frazelle <jess@docker.com>

# Note: Tor is only in testing repo -> http://pkgs.alpinelinux.org/packages?package=emacs&repo=all&arch=x86_64
RUN apk --no-cache add \
	--repository http://dl-3.alpinelinux.org/alpine/edge/testing/ \
	tor

# default port to used for incoming Tor connections
# can be changed by changing 'ORPort' in torrc
EXPOSE 9001

# copy in our torrc files
COPY torrc.bridge /etc/tor/torrc.bridge
COPY torrc.middle /etc/tor/torrc.middle
COPY torrc.exit /etc/tor/torrc.exit

# make sure files are owned by tor user
RUN chown -R tor /etc/tor

USER tor

ENTRYPOINT [ "tor" ]
