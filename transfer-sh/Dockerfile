FROM alpine:latest as builder
LABEL maintainer "Jess Frazelle <jess@linux.com>"

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN	apk --no-cache add \
	ca-certificates

ENV TRANSFER_SH_VERSION master

RUN	set -x \
	&& apk --no-cache add \
		bash \
		go \
		git \
		gcc \
		g++ \
		libc-dev \
		libgcc \
		make \
	&& git clone --depth 1 --branch ${TRANSFER_SH_VERSION} https://github.com/dutchcoders/transfer.sh /go/src/github.com/dutchcoders/transfer.sh \
	&& cd /go/src/github.com/dutchcoders/transfer.sh \
	&& go build -o /usr/bin/transfer.sh \
	&& echo "Build complete."

# Create a clean image without build dependencies
FROM alpine:latest

COPY --from=builder /usr/bin/transfer.sh /usr/bin/transfer.sh

ENTRYPOINT [ "transfer.sh" ]
CMD [ "--help" ]
