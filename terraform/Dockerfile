FROM alpine:3.6
LABEL maintainer "Sid Carter <me@sidcarter.com>"

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN	apk --no-cache add \
	ca-certificates

ENV TERRAFORM_VERSION v0.11.1

RUN buildDeps=' \
		bash \
		go \
		git \
		gcc \
		g++ \
		libc-dev \
		libgcc \
		make \
		zip \
	' \
	set -x \
	&& apk --no-cache add --repository https://dl-3.alpinelinux.org/alpine/edge/community $buildDeps \
	&& go get github.com/Soulou/curl-unix-socket \
	&& mv /go/bin/curl-unix-socket /usr/bin/ \
	&& mkdir -p /go/src/github.com/hashicorp /etc/terraform.d \
	&& git clone --depth 1 --branch ${TERRAFORM_VERSION} https://github.com/hashicorp/terraform /go/src/github.com/hashicorp/terraform \
	&& cd /go/src/github.com/hashicorp/terraform \
	&& XC_ARCH="amd64" XC_OS="linux" make bin \
	&& mv pkg/linux_amd64/terraform /usr/bin/ \
	&& apk del $buildDeps \
	&& rm -rf /go \
	&& echo "Build complete."


ENTRYPOINT [ "terraform" ]
