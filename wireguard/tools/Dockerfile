FROM alpine:latest

LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apk add --no-cache \
	ca-certificates \
	libmnl

COPY --from=r.j3ss.co/wireguard:install /usr/bin/wg /usr/bin/wg
COPY --from=r.j3ss.co/wireguard:install /usr/share/man/man8/wg.8 /usr/share/man/man8/wg.8

ENTRYPOINT ["wg"]
CMD ["--help"]
