FROM debian:bullseye-slim

RUN apt-get update && apt-get install -y \
	bash \
	build-essential \
	ca-certificates \
	curl \
	python \
	&& rm -rf /var/lib/apt/lists/*

RUN curl -sSL -o /usr/bin/oecore-x86_64-armv6-toolchain-nodistro.0.sh https://openpower.xyz/job/openbmc-build-sdk/distro=ubuntu,target=romulus/lastSuccessfulBuild/artifact/deploy/sdk/oecore-x86_64-armv6-toolchain-nodistro.0.sh \
	&& chmod +x /usr/bin/oecore-x86_64-armv6-toolchain-nodistro.0.sh

RUN mkdir -p /sdk/romulus \
	&& oecore-x86_64-armv6-toolchain-nodistro.0.sh

RUN echo ". /usr/local/oecore-x86_64/environment-setup-armv6-openbmc-linux-gnueabi" > ~/.bash_history

ENTRYPOINT ["bash"]
