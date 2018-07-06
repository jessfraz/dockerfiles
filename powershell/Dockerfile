FROM debian:sid
LABEL maintainer "Christian Koep <christiankoep@gmail.com>"

ENV POWERSHELL_VERSION 6.1.0-preview.3

RUN apt-get update && apt-get install -y \
	ca-certificates \
	curl \
	dpkg \
	libicu57 \
	libssl1.0.2 \
	liblttng-ust0 \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

RUN cd /usr/src \
	&& curl -L -O "https://github.com/PowerShell/PowerShell/releases/download/v${POWERSHELL_VERSION}/powershell-preview_${POWERSHELL_VERSION}-1.debian.9_amd64.deb" \
	&& dpkg -i "powershell-preview_${POWERSHELL_VERSION}-1.debian.9_amd64.deb" \
	&& ln -snf /opt/microsoft/powershell/6-preview/pwsh /usr/bin/pwsh \
	&& apt-get install -fy \
	&& rm -rf /var/lib/apt/lists/* /usr/src/*

ENTRYPOINT [ "/usr/bin/pwsh" ]
