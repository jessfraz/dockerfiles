FROM golang:alpine as builder
MAINTAINER Jessica Frazelle <jess@linux.com>

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN	apk add --no-cache \
	bash \
	ca-certificates \
	git \
	make \
	zip

ENV TERRAFORM_VERSION v0.11.7

RUN go get github.com/hashicorp/terraform

WORKDIR /go/src/github.com/hashicorp/terraform

RUN git checkout "${TERRAFORM_VERSION}"

# Install the vendor packages so stringer works.
# See: https://github.com/golang/go/issues/10249
RUN go install ./vendor/...

RUN XC_ARCH="amd64" XC_OS="linux" LD_FLAGS=" -extldflags -static" make bin \
	&& mv bin/terraform /usr/bin/terraform

FROM alpine:latest

RUN apk add --no-cache \
	bash \
	tar

COPY --from=builder /usr/bin/terraform /usr/bin/terraform
COPY --from=builder /etc/ssl/certs/ /etc/ssl/certs

ENTRYPOINT [ "terraform" ]
CMD [ "--help" ]
