FROM debian:jessie
MAINTAINER Jessie Frazelle <jess@linux.com>

RUN apt-get update && apt-get install -y \
	gnupg \
	--no-install-recommends \
	&& apt-key adv --keyserver hkp://pgp.mit.edu:80 --recv-keys 573BFD6B3D8FBC641079A6ABABF5BD827BD9BF62 \
	&& echo "deb http://nginx.org/packages/mainline/debian/ jessie nginx" >> /etc/apt/sources.list

RUN apt-get update && apt-get install -y \
	ca-certificates \
	lua-cjson \
	lua-iconv \
	nginx-extras \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
	&& ln -sf /dev/stderr /var/log/nginx/error.log

COPY nginx.conf /etc/nginx/nginx.conf
COPY mime.types /etc/nginx/mime.types
COPY telize.conf /etc/nginx/conf.d/telize.conf

EXPOSE 80 443

ENV TELIZE_VERSION 1.07

RUN buildDeps=' \
		curl \
		git \
	' \
	&& set -x \
	&& apt-get update && apt-get install -y $buildDeps --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& mkdir -p /usr/share/GeoIP \
	&& curl -sSL https://geolite.maxmind.com/download/geoip/database/GeoLiteCountry/GeoIP.dat.gz -o /usr/share/GeoIP/GeoIP.dat.gz \
	&& curl -sSL http://geolite.maxmind.com/download/geoip/database/GeoLiteCity.dat.gz -o /usr/share/GeoIP/GeoLiteCity.dat.gz \
	&& curl -sSL http://download.maxmind.com/download/geoip/database/asnum/GeoIPASNum.dat.gz -o /usr/share/GeoIP/GeoIPASNum.dat.gz \
	&& gunzip /usr/share/GeoIP/*gz \
	&& git clone --depth 1 --branch "${TELIZE_VERSION}" https://github.com/fcambus/telize.git /usr/src/telize \
	&& cd /usr/src/telize \
	&& cp timezone*.conf /etc/nginx/ \
	&& rm -rf /usr/src/telize \
	&& apt-get purge -y --auto-remove $buildDeps

CMD ["nginx", "-g", "daemon off;"]
