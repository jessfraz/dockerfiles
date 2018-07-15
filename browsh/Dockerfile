FROM alpine:latest
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

# Install bash so we have it.
RUN apk add --no-cache \
		bash

# Install firefox.
RUN apk add --no-cache \
		firefox \
		--repository https://dl-4.alpinelinux.org/alpine/edge/testing \
	&& firefox --version

# Install browsh.
ENV BROWSH_VERSION 1.3.3
RUN wget "https://github.com/browsh-org/browsh/releases/download/v${BROWSH_VERSION}/browsh_${BROWSH_VERSION}_linux_amd64" -O /usr/local/bin/browsh \
	&& chmod a+x /usr/local/bin/browsh

# Create user and change ownership
RUN addgroup -g 666 -S browsh \
	&& adduser -u 666 -SHG browsh browsh

#WORKDIR /home/browsh
#USER browsh

# Firefox behaves quite differently to normal on its first run, so by getting
# that over and done with here when there's no user to be dissapointed means
# that all future runs will be consistent.
RUN TERM=xterm browsh & \
		pidsave=$!; \
		sleep 10; kill $pidsave || true;

ENTRYPOINT [ "/usr/local/bin/browsh" ]
