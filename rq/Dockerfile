# rq - https://github.com/dflemstr/rq

FROM alpine:edge as builder

RUN apk update --no-cache \
    && apk add --no-cache \
    curl \
    ca-certificates \
    && curl -fSL "https://s3-eu-west-1.amazonaws.com/record-query/record-query/x86_64-unknown-linux-musl/rq" --output /usr/local/bin/rq \
    && chmod +x /usr/local/bin/rq

FROM alpine:edge

COPY --from=builder /usr/local/bin/rq /usr/local/bin/rq

ENTRYPOINT ["rq"]

CMD ["--help"]
