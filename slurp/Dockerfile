FROM golang:1.11-alpine AS builder

RUN	apk --no-cache add \
	ca-certificates \
    git \
    make
    
ENV SLURP_VERSION master

RUN mkdir -p /go/src/slurp \
	&& go get -u github.com/yamakira/slurp/... \
    && git clone --depth 1 --branch "${SLURP_VERSION}" https://github.com/yamakira/slurp.git /go/src/slurp \
	&& cd /go/src/slurp \
    && go install ./... \
	&& cp -vr /go/bin/* /usr/local/bin/ \
	&& echo "Build complete."

FROM alpine:latest

RUN	apk --no-cache add \
	ca-certificates

COPY --from=builder /usr/local/bin/slurp /usr/bin/slurp
COPY --from=builder /go/src/slurp/permutations.json /root/permutations.json

WORKDIR /root

ENTRYPOINT [ "slurp" ]

