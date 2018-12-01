FROM golang:1.10-alpine AS builder

RUN	apk --no-cache add \
	ca-certificates \
    git \
    make
    
ENV AMASS_VERSION 2.8.4

RUN mkdir -p /go/src/amass \
	&& go get -u github.com/OWASP/Amass/... \
    && git clone --depth 1 --branch "${AMASS_VERSION}" https://github.com/OWASP/Amass.git /go/src/amass \
	&& cd /go/src/amass \
    && go install ./... \
	&& cp -vr /go/bin/* /usr/local/bin/ \
	&& echo "Build complete."

FROM alpine:latest

RUN	apk --no-cache add \
	ca-certificates

COPY --from=builder /usr/local/bin/amass /usr/bin/amass

ENTRYPOINT [ "amass" ]

