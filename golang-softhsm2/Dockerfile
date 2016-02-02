FROM golang:latest

RUN apt-get update && apt-get install -y \
	sqlite3 \
	&& rm -rf /var/lib/apt/lists/*

RUN buildDeps=' \
		autoconf \
		automake \
		build-essential \
		libtool \
		libssl-dev \
		libsqlite3-dev \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& git clone https://github.com/opendnssec/SoftHSMv2.git /usr/src/SoftHSMv2 \
	&& cd /usr/src/SoftHSMv2 \
	&& sh autogen.sh \
	&& ./configure --with-objectstore-backend-db \
	&& make \
	&& make install \
	&& rm -rf /usr/src/SoftHSMv2 \
	&& apt-get purge -y --auto-remove $buildDeps \
	&& mkdir -p /softhsm2/tokens

# Default locations for the SoftHSM2 configuration and PKCS11 bindings
ENV SOFTHSM2_CONF="/etc/softhsm2/softhsm2.conf"
ENV LIBDIR="/usr/local/lib/softhsm/"
COPY ./softhsm2.conf /etc/softhsm2/softhsm2.conf

ENTRYPOINT ["softhsm2-util"]
