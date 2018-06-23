FROM alpine:latest
LABEL maintainer "Jess Frazelle <jess@linux.com>"

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN	apk --no-cache add \
	ca-certificates

ENV WATCHTOWER_VERSION v0.3.0

RUN buildDeps=' \
		bash \
		go \
		git \
		gcc \
		g++ \
		libc-dev \
		libgcc \
		make \
	' \
	set -x \
	&& apk --no-cache add $buildDeps \
	&& git clone --depth 1 --branch ${WATCHTOWER_VERSION} https://github.com/v2tec/watchtower /go/src/github.com/v2tec/watchtower \
	&& go get github.com/Masterminds/glide \
	&& cd /go/src/github.com/v2tec/watchtower \
	&& glide install \
	&& go build -o /usr/bin/watchtower \
	&& apk del $buildDeps \
	&& rm -rf /go \
	&& echo "Build complete."


ENTRYPOINT [ "watchtower" ]
CMD [ "--help" ]
