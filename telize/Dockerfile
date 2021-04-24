FROM shurshun/openresty:latest

STOPSIGNAL SIGTERM

EXPOSE 80 443

ENV TELIZE_VERSION 66063c6c6e5bbbafcf493c5bc7c825f0a6e1b03d
ENV LICENSE_KEY lgNvGyhnUKpa5PJi

RUN apk add --no-cache \
	ca-certificates \
	curl \
	git

RUN addgroup -S nginx \
	&& adduser -D -S -h /var/cache/nginx -s /sbin/nologin -G nginx nginx

RUN set -x \
       && mkdir -p /usr/share/GeoIP \
       && curl -sSL "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-Country&license_key=${LICENSE_KEY}&suffix=tar.gz" | tar -xzf - --strip-components 1 -C /usr/share/GeoIP \
       && curl -sSL "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key=${LICENSE_KEY}&suffix=tar.gz" | tar -xzf - --strip-components 1 -C /usr/share/GeoIP \
       && curl -sSL "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-ASN&license_key=${LICENSE_KEY}&suffix=tar.gz" | tar -xzf - --strip-components 1 -C /usr/share/GeoIP \
       && git clone https://github.com/fcambus/telize.git /usr/src/telize \
       && ( \
               cd /usr/src/telize \
               && git checkout "$TELIZE_VERSION" \
               && cp *.conf /etc/nginx/ \
       ) \
       && rm -rf /usr/src/telize

COPY nginx.conf /etc/nginx/nginx.conf
COPY mime.types /etc/nginx/mime.types
COPY telize.conf /etc/nginx/conf.d/telize.conf

CMD ["nginx", "-g", "daemon off;"]
