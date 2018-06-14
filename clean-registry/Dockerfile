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
ENV GOPATH /go

# Install reg
RUN set -x \
	&& apk add --no-cache --virtual .build-deps \
		go \
		git \
		gcc \
		libc-dev \
		libgcc \
	&& go get github.com/genuinetools/reg \
	&& mv ${GOPATH}/bin/reg /usr/bin/reg \
	&& apk del .build-deps \
	&& rm -rf /go \
	&& echo "Build complete."

ENTRYPOINT ["clean-registry"]
