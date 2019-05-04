
# Generate a password
#
#   docker run \
#          --rm \
#          --net none \
#          pwgen -scy1n 20

FROM alpine:latest

RUN apk --no-cache add \
    pwgen

ENTRYPOINT ["pwgen"]