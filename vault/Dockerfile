FROM golang:alpine as builder
MAINTAINER Jessica Frazelle <jess@linux.com>

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN	apk add --no-cache \
	--repository https://dl-3.alpinelinux.org/alpine/edge/main/ \
	bash \
	ca-certificates \
	git \
	make \
	npm \
	yarn \
	zip

ENV VAULT_VERSION v0.10.4

RUN go get github.com/hashicorp/vault

WORKDIR /go/src/github.com/hashicorp/vault

RUN git checkout "${VAULT_VERSION}"

#RUN yarn global add bower

RUN XC_ARCH="amd64" XC_OS="linux" XC_OSARCH="linux/amd64" LD_FLAGS=" -extldflags -static " make bootstrap static-dist bin \
	&& mv bin/vault /usr/bin/vault

FROM alpine:latest

COPY --from=builder /usr/bin/vault /usr/bin/vault
COPY --from=builder /etc/ssl/certs/ /etc/ssl/certs

ENTRYPOINT [ "vault" ]
CMD [ "--help" ]
