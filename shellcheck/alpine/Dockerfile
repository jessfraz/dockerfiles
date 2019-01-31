FROM koalaman/shellcheck-alpine as builder

FROM alpine:edge

RUN apk --no-cache add \
    file \
    bash \
    findutils \
    grep

COPY --from=builder /bin/shellcheck /bin/shellcheck

CMD ["shellcheck"]
