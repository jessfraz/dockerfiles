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
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apk --no-cache add \
	bash \
	tor

# default port to used for incoming Tor connections
# can be changed by changing 'ORPort' in torrc
EXPOSE 9001

# copy in our torrc files
COPY torrc.bridge /etc/tor/torrc.bridge
COPY torrc.middle /etc/tor/torrc.middle
COPY torrc.exit /etc/tor/torrc.exit

# copy the run script
COPY run.sh /run.sh
RUN chmod ugo+rx /run.sh

# default environment variables
ENV RELAY_NICKNAME hacktheplanet
ENV RELAY_TYPE middle
ENV RELAY_BANDWIDTH_RATE 100 KBytes
ENV RELAY_BANDWIDTH_BURST 200 KBytes
ENV RELAY_PORT 9001

# make sure files are owned by tor user
RUN chown -R tor /etc/tor

USER tor

RUN mkdir /var/lib/tor/.tor
VOLUME /var/lib/tor/.tor
RUN chown -R tor /var/lib/tor/.tor

ENTRYPOINT [ "/run.sh" ]
