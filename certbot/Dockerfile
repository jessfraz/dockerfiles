FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
	ca-certificates \
	curl \
	--no-install-recommends

RUN export GNUPGHOME="$(mktemp -d)" \
	&& gpg --keyserver pgp.mit.edu --recv-key A2CFB51FA275A7286234E7B24D17C995CD9775F2 \
	&& ( \
	cd /tmp \
	&& curl -O https://dl.eff.org/certbot-auto \
	&& chmod a+x ./certbot-auto \
	&& curl -O https://dl.eff.org/certbot-auto.asc \
	&& gpg --trusted-key 4D17C995CD9775F2 --verify certbot-auto.asc certbot-auto \
	&& mv certbot-auto /usr/local/bin/ \
	) \
	&& rm -r "$GNUPGHOME" /tmp

ENTRYPOINT [ "certbot-auto" ]
