FROM golang:alpine as builder
MAINTAINER Jessica Frazelle <jess@linux.com>

ENV PATH /go/bin:/usr/local/go/bin:$PATH
ENV GOPATH /go

RUN	apk add --no-cache \
	bash \
	ca-certificates \
	gcc \
	git \
	make \
	musl-dev \
	zip

ENV TERRAFORM_VERSION v0.14.7

RUN go get github.com/hashicorp/terraform || true

WORKDIR /go/src/github.com/hashicorp/terraform

RUN git checkout "${TERRAFORM_VERSION}"

RUN CGO_ENABLED=0 go build -a -tags netgo -ldflags '-w -extldflags "-static"' \
	-o bin/terraform && \
	mv bin/terraform /usr/bin/terraform

FROM alpine:latest

RUN apk add --no-cache \
	bash \
	tar

COPY --from=builder /usr/bin/terraform /usr/bin/terraform
COPY --from=builder /etc/ssl/certs/ /etc/ssl/certs

ENTRYPOINT [ "terraform" ]
CMD [ "--help" ]
