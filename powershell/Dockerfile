FROM ubuntu:16.04
LABEL maintainer "Christian Koep <christiankoep@gmail.com>"

ENV POWERSHELL_VERSION 6.0.0-rc

RUN apt-get update && apt-get install -y \
	ca-certificates \
	curl \
	libcurl3 \
	libicu55 \
	libssl1.0.0 \
	libunwind8 \
	liblttng-ust0 \
	dpkg \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN cd /usr/src \
	&& curl -L -O https://github.com/PowerShell/PowerShell/releases/download/v${POWERSHELL_VERSION}/powershell_${POWERSHELL_VERSION}-1.ubuntu.16.04_amd64.deb \
	&& dpkg -i powershell_${POWERSHELL_VERSION}-1.ubuntu.16.04_amd64.deb \
	&& apt-get install -fy \
	&& rm -rf /var/lib/apt/lists/* /usr/src/*

ENTRYPOINT [ "/usr/bin/powershell" ]
