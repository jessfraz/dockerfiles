FROM r.j3ss.co/reg as reg
FROM jess/gcloud

RUN	apk add --no-cache \
	ca-certificates \
	bash \
	parallel

# Install google cloud sdk
# Download clean-registry script
RUN set -x \
	&& apk add --no-cache --virtual .build-deps \
		curl \
	&& curl -sSL -o /usr/bin/clean-registry https://raw.githubusercontent.com/jessfraz/dotfiles/master/bin/clean-registry \
	&& chmod +x /usr/bin/clean-registry \
	&& apk del .build-deps

WORKDIR /root

COPY --from=reg /usr/bin/reg /usr/bin/reg

ENTRYPOINT ["clean-registry"]
