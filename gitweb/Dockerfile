FROM nginx:latest

RUN apt-get update && apt-get install -y \
	fcgiwrap \
	gitweb \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* \
	&& mv /usr/share/gitweb /var/www/

COPY nginx /etc/nginx

CMD service fcgiwrap start && nginx -g "daemon off;"
