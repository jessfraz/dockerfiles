FROM golang:latest as builder
MAINTAINER Jessica Frazelle <jess@linux.com>

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN apt-get update && apt-get install -y \
	ca-certificates \
	gcc \
	git \
	make \
	ruby-dev \
	ruby \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV CONSUL_VERSION v1.2.2

RUN go get github.com/hashicorp/consul

WORKDIR /go/src/github.com/hashicorp/consul

RUN git checkout "${CONSUL_VERSION}"

# Install deps for UI.
RUN gem install \
	bundler \
	--no-ri --no-rdoc

RUN cd ui \
	&& make dist

RUN TERM=xterm XC_ARCH="amd64" XC_OS="linux" LD_FLAGS=" -extldflags -static" make tools static-assets bin \
	&& mv bin/consul /usr/bin/consul

FROM alpine:latest

COPY --from=builder /usr/bin/consul /usr/bin/consul
COPY --from=builder /etc/ssl/certs/ /etc/ssl/certs

ENTRYPOINT [ "consul" ]
CMD [ "--help" ]
