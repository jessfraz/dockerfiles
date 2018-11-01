FROM docker:latest

RUN apk add --no-cache \
	bash \
	ca-certificates \
	curl \
	tar

COPY build.sh /usr/local/bin/build

ENTRYPOINT ["build"]
