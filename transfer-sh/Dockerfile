FROM alpine:latest
LABEL maintainer "Jess Frazelle <jess@linux.com>"

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN	apk --no-cache add \
	ca-certificates

ENV TRANSFER_SH_VERSION master

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
	&& git clone --depth 1 --branch ${TRANSFER_SH_VERSION} https://github.com/dutchcoders/transfer.sh /go/src/github.com/dutchcoders/transfer.sh \
	&& cd /go/src/github.com/dutchcoders/transfer.sh \
	&& go build -o /usr/bin/transfer.sh \
	&& apk del $buildDeps \
	&& rm -rf /go \
	&& echo "Build complete."


ENTRYPOINT [ "transfer.sh" ]
CMD [ "--help" ]
