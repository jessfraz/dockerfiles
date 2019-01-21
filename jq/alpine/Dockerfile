#
# docker run --rm -i "westonsteimel/jq" "$@"
#

FROM alpine:edge

RUN apk --no-cache add jq

ENTRYPOINT ["jq"]
CMD ["--help"]
