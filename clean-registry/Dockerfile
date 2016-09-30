FROM python:2-alpine

RUN	apk add --no-cache \
	ca-certificates \
	bash \
	parallel

# Install google cloud sdk
# Download clean-registry script
RUN set -x \
	&& apk add --no-cache --virtual .build-deps \
		curl \
		tar \
	&& curl -sSL -o /tmp/google-cloud-sdk.tar.gz https://dl.google.com/dl/cloudsdk/release/google-cloud-sdk.tar.gz \
	&& curl -sSL -o /usr/bin/clean-registry https://raw.githubusercontent.com/jessfraz/dotfiles/master/bin/clean-registry \
	&& chmod +x /usr/bin/clean-registry \
	&& mkdir -p /usr/src/google-cloud-sdk \
	&& tar -xzf /tmp/google-cloud-sdk.tar.gz -C /usr/src/google-cloud-sdk --strip-components 1 \
	&& rm /tmp/google-cloud-sdk.tar.gz \
	&& ( \
		cd /usr/src/google-cloud-sdk \
		&& ./install.sh \
        	--usage-reporting false \
        	--path-update true \
	) \
	&& apk del .build-deps

WORKDIR /root
ENV PATH $PATH:/usr/src/google-cloud-sdk/bin
ENV GOPATH /go

# Install reg
RUN set -x \
	&& apk add --no-cache --virtual .build-deps \
		go \
		git \
		gcc \
		libc-dev \
		libgcc \
	&& go get github.com/jessfraz/reg \
	&& mv ${GOPATH}/bin/reg /usr/bin/reg \
	&& apk del .build-deps \
	&& rm -rf /go \
	&& echo "Build complete."

ENTRYPOINT ["clean-registry"]
