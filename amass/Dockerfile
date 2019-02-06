FROM golang:alpine AS builder

RUN	apk --no-cache add \
	ca-certificates \
    git \
    make
    
ENV AMASS_VERSION 2.9.1

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
COPY --from=builder /usr/local/bin/amass.db /usr/bin/amass.db
COPY --from=builder /usr/local/bin/amass.netdomains /usr/bin/amass.netdomains
COPY --from=builder /usr/local/bin/amass.viz /usr/bin/amass.viz
COPY --from=builder /go/src/github.com/OWASP/Amass/wordlists /wordlists

ENTRYPOINT [ "amass" ]

