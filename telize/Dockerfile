FROM alpine:latest

RUN apk add --no-cache \
	lua5.1-cjson \
	luajit

ENV NGINX_VERSION 1.15.2
# https://github.com/simplresty/ngx_devel_kit/releases
ENV NGX_DEVEL_KIT_VERSION v0.3.1rc1
# https://github.com/openresty/lua-nginx-module/releases
ENV LUA_NGINX_MODULE_VERSION v0.10.13
# https://github.com/leev/ngx_http_geoip2_module/releases
ENV NGX_HTTP_GEOIP2_MODULE_VERSION 3.0
# https://github.com/maxmind/libmaxminddb/releases
ENV LIBMAXMINDDB_VERSION 1.3.2

# Tell nginx's build system where to find LuaJIT 2.1:
ENV LUAJIT_LIB=/usr/lib/
ENV LUAJIT_INC=/usr/include/luajit-2.1/

RUN GPG_KEYS=B0F4253373F8F6F510D42178520A9993A1C052F8 \
	&& CONFIG="\
		--prefix=/etc/nginx \
		--sbin-path=/usr/sbin/nginx \
		--modules-path=/usr/lib/nginx/modules \
		--conf-path=/etc/nginx/nginx.conf \
		--error-log-path=/var/log/nginx/error.log \
		--http-log-path=/var/log/nginx/access.log \
		--pid-path=/var/run/nginx.pid \
		--lock-path=/var/run/nginx.lock \
		--http-client-body-temp-path=/var/cache/nginx/client_temp \
		--http-proxy-temp-path=/var/cache/nginx/proxy_temp \
		--http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp \
		--http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp \
		--http-scgi-temp-path=/var/cache/nginx/scgi_temp \
		--user=nginx \
		--group=nginx \
		--with-http_ssl_module \
		--with-http_realip_module \
		--with-http_addition_module \
		--with-http_sub_module \
		--with-http_dav_module \
		--with-http_flv_module \
		--with-http_mp4_module \
		--with-http_gunzip_module \
		--with-http_gzip_static_module \
		--with-http_random_index_module \
		--with-http_secure_link_module \
		--with-http_stub_status_module \
		--with-http_auth_request_module \
		--with-http_xslt_module=dynamic \
		--with-http_image_filter_module=dynamic \
		--with-http_geoip_module=dynamic \
		--with-threads \
		--with-stream \
		--with-stream_ssl_module \
		--with-stream_ssl_preread_module \
		--with-stream_realip_module \
		--with-stream_geoip_module=dynamic \
		--with-http_slice_module \
		--with-mail \
		--with-mail_ssl_module \
		--with-compat \
		--with-file-aio \
		--with-http_v2_module \
		--with-ld-opt='-Wl,-rpath,/usr/lib/' \
		--add-module=/usr/src/ngx_devel_kit \
		--add-module=/usr/src/lua-nginx-module \
		--add-module=/usr/src/ngx_http_geoip2_module \
	" \
	&& addgroup -S nginx \
	&& adduser -D -S -h /var/cache/nginx -s /sbin/nologin -G nginx nginx \
	&& apk add --no-cache --virtual .build-deps \
		autoconf \
		automake \
		gcc \
		git \
		libc-dev \
		make \
		openssl-dev \
		pcre-dev \
		zlib-dev \
		linux-headers \
		curl \
		gnupg \
		libxslt-dev \
		gd-dev \
		geoip-dev \
		luajit-dev \
		musl-utils \
		file \
	&& git clone --depth 1 --branch "${NGX_DEVEL_KIT_VERSION}" https://github.com/simplresty/ngx_devel_kit.git /usr/src/ngx_devel_kit \
	&& git clone --depth 1 --branch "${LUA_NGINX_MODULE_VERSION}" https://github.com/openresty/lua-nginx-module.git /usr/src/lua-nginx-module \
	&& git clone --depth 1 --branch "${NGX_HTTP_GEOIP2_MODULE_VERSION}" https://github.com/leev/ngx_http_geoip2_module.git /usr/src/ngx_http_geoip2_module \
	&& mkdir -p /usr/src/libmaxminddb \
	&& curl -sSL "https://github.com/maxmind/libmaxminddb/releases/download/${LIBMAXMINDDB_VERSION}/libmaxminddb-${LIBMAXMINDDB_VERSION}.tar.gz" | tar -xzf - --strip-components 1 -C /usr/src/libmaxminddb \
	&& ( \
		cd /usr/src/libmaxminddb \
		&& ./configure \
		&& make \
		&& make check \
		&& make install \
		&& ldconfig || true \
	) \
	&& curl -fSL http://nginx.org/download/nginx-$NGINX_VERSION.tar.gz -o nginx.tar.gz \
	&& curl -fSL http://nginx.org/download/nginx-$NGINX_VERSION.tar.gz.asc  -o nginx.tar.gz.asc \
	&& export GNUPGHOME="$(mktemp -d)" \
	&& found=''; \
	for server in \
		ha.pool.sks-keyservers.net \
		hkp://keyserver.ubuntu.com:80 \
		hkp://p80.pool.sks-keyservers.net:80 \
		pgp.mit.edu \
	; do \
		echo "Fetching GPG key $GPG_KEYS from $server"; \
		gpg --keyserver "$server" --keyserver-options timeout=10 --recv-keys "$GPG_KEYS" && found=yes && break; \
	done; \
	test -z "$found" && echo >&2 "error: failed to fetch GPG key $GPG_KEYS" && exit 1; \
	gpg --batch --verify nginx.tar.gz.asc nginx.tar.gz \
	&& rm -r "$GNUPGHOME" nginx.tar.gz.asc \
	&& mkdir -p /usr/src \
	&& tar -zxC /usr/src -f nginx.tar.gz \
	&& rm nginx.tar.gz \
	&& ( \
		cd /usr/src/nginx-$NGINX_VERSION \
		&& ./configure $CONFIG --with-debug \
		&& make -j$(getconf _NPROCESSORS_ONLN) \
		&& mv objs/nginx objs/nginx-debug \
		&& mv objs/ngx_http_xslt_filter_module.so objs/ngx_http_xslt_filter_module-debug.so \
		&& mv objs/ngx_http_image_filter_module.so objs/ngx_http_image_filter_module-debug.so \
		&& mv objs/ngx_http_geoip_module.so objs/ngx_http_geoip_module-debug.so \
		&& mv objs/ngx_stream_geoip_module.so objs/ngx_stream_geoip_module-debug.so \
		&& ./configure $CONFIG \
		&& make -j$(getconf _NPROCESSORS_ONLN) \
		&& make install \
		&& rm -rf /etc/nginx/html/ \
		&& mkdir /etc/nginx/conf.d/ \
		&& mkdir -p /usr/share/nginx/html/ \
		&& install -m644 html/index.html /usr/share/nginx/html/ \
		&& install -m644 html/50x.html /usr/share/nginx/html/ \
		&& install -m755 objs/nginx-debug /usr/sbin/nginx-debug \
		&& install -m755 objs/ngx_http_xslt_filter_module-debug.so /usr/lib/nginx/modules/ngx_http_xslt_filter_module-debug.so \
		&& install -m755 objs/ngx_http_image_filter_module-debug.so /usr/lib/nginx/modules/ngx_http_image_filter_module-debug.so \
		&& install -m755 objs/ngx_http_geoip_module-debug.so /usr/lib/nginx/modules/ngx_http_geoip_module-debug.so \
		&& install -m755 objs/ngx_stream_geoip_module-debug.so /usr/lib/nginx/modules/ngx_stream_geoip_module-debug.so \
		&& ln -s ../../usr/lib/nginx/modules /etc/nginx/modules \
		&& strip /usr/sbin/nginx* \
		&& strip /usr/lib/nginx/modules/*.so \
	) \
	&& rm -rf /usr/src/nginx-$NGINX_VERSION /usr/src/ngx_devel_kit /usr/src/lua-nginx-module /usr/src/ngx_http_geoip2_module /usr/src/libmaxminddb \
	\
	# Bring in gettext so we can get `envsubst`, then throw
	# the rest away. To do this, we need to install `gettext`
	# then move `envsubst` out of the way so `gettext` can
	# be deleted completely, then move `envsubst` back.
	&& apk add --no-cache --virtual .gettext gettext \
	&& mv /usr/bin/envsubst /tmp/ \
	\
	&& runDeps="$( \
		scanelf --needed --nobanner --format '%n#p' /usr/sbin/nginx /usr/lib/nginx/modules/*.so /tmp/envsubst \
			| tr ',' '\n' \
			| sort -u \
			| awk 'system("[ -e /usr/local/lib/" $1 " ]") == 0 { next } { print "so:" $1 }' \
	)" \
	&& apk add --no-cache --virtual .nginx-rundeps $runDeps \
	&& apk del .build-deps \
	&& apk del .gettext \
	&& mv /tmp/envsubst /usr/local/bin/ \
	\
	# forward request and error logs to docker log collector
	&& ln -sf /dev/stdout /var/log/nginx/access.log \
	&& ln -sf /dev/stderr /var/log/nginx/error.log

STOPSIGNAL SIGTERM

EXPOSE 80 443

ENV TELIZE_VERSION master

RUN set -x \
	&& apk add --no-cache --virtual .build-deps \
		curl \
		git \
	&& rm -rf /var/lib/apt/lists/* \
	&& mkdir -p /usr/share/GeoIP \
	&& curl -sSL "http://geolite.maxmind.com/download/geoip/database/GeoLite2-Country.tar.gz" | tar -xzf - --strip-components 1 -C /usr/share/GeoIP \
	&& curl -sSL "http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.tar.gz" | tar -xzf - --strip-components 1 -C /usr/share/GeoIP \
	&& curl -sSL "http://geolite.maxmind.com/download/geoip/database/GeoLite2-ASN.tar.gz" | tar -xzf - --strip-components 1 -C /usr/share/GeoIP \
	&& git clone --depth 1 --branch "${TELIZE_VERSION}" https://github.com/fcambus/telize.git /usr/src/telize \
	&& ( \
		cd /usr/src/telize \
		&& cp *.conf /etc/nginx/ \
	) \
	&& rm -rf /usr/src/telize \
	&& apk del .build-deps

COPY nginx.conf /etc/nginx/nginx.conf
COPY mime.types /etc/nginx/mime.types
COPY telize.conf /etc/nginx/conf.d/telize.conf

CMD ["nginx", "-g", "daemon off;"]
