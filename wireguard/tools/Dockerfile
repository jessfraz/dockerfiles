FROM debian:sid-slim

LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apt update && apt -y install \
	ca-certificates \
	libmnl-dev \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

COPY --from=r.j3ss.co/wireguard:install /usr/bin/wg /usr/bin/wg
COPY --from=r.j3ss.co/wireguard:install /usr/share/man/man8/wg.8 /usr/share/man/man8/wg.8

ENTRYPOINT ["wg"]
CMD ["--help"]
