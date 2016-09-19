FROM debian:sid
MAINTAINER Christian Koep <christian.koep@fom-net.de>

ENV POWERSHELL_VERSION 6.0.0-alpha.10

RUN apt-get update && apt-get install -y \
	ca-certificates \
	curl \
	libunwind8 \
	libicu55 \
	dpkg \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN cd /usr/src \
	&& curl -L -O https://github.com/PowerShell/PowerShell/releases/download/v${POWERSHELL_VERSION}/powershell_${POWERSHELL_VERSION}-1ubuntu1.16.04.1_amd64.deb \
	&& dpkg -i powershell_${POWERSHELL_VERSION}-1ubuntu1.16.04.1_amd64.deb \
	&& apt-get install -fy \
	&& rm -rf /var/lib/apt/lists/* /usr/src/*

ENTRYPOINT [ "/usr/bin/powershell" ]
