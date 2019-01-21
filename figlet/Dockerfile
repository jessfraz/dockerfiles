#
# docker run --rm -i "westonsteimel/figlet" "$@"
#

FROM alpine:edge

RUN apk --no-cache add figlet

ENTRYPOINT ["figlet"]
CMD ["--help"]
