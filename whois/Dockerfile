FROM alpine
MAINTAINER Airton Zanon "airtonzanon@gmail.com"

RUN echo "@edge http://dl-4.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories && apk --update --force add whois@edge

ENTRYPOINT ["whois"]
