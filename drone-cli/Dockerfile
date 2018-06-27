# Run drone-cli in a container
#
# docker run --rm -it \
#   -e DRONE_SERVER=... \
#   -e DRONE_TOKEN=... \
#   jess/drone-cli
#
FROM alpine:latest
LABEL maintainer "Lyz <lyz@riseup.net>"

ENV HOME /home/user
RUN adduser -u 1001 -D user \
    && chown -R user:user $HOME

RUN apk add --no-cache curl

RUN curl http://downloads.drone.io/release/linux/amd64/drone.tar.gz | tar zx \
    && mv drone /usr/local/bin

WORKDIR $HOME
USER user

ENTRYPOINT [ "/usr/local/bin/drone" ]
