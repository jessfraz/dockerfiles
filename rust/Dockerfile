FROM debian:jessie
MAINTAINER Jessica Frazelle <jess@docker.com>

RUN apt-get update && apt-get install -y \
    ca-certificates \
	curl \
    --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

ENV PATH /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/rust/rustc/bin

RUN mkdir -p /usr/local/rust \
	&& curl -sSL https://static.rust-lang.org/dist/rust-nightly-x86_64-unknown-linux-gnu.tar.gz | tar -v -C /usr/local/rust -xz --strip-components 1 \
	&& cd /usr/local/rust \
	&& ./install.sh
