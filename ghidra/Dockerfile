# Usage:
# docker run --rm -it \
#	-v $PWD:/home/ghidra \ 
#   -v /tmp/.X11-unix:/tmp/.X11-unix \
#   -e DISPLAY=unix$DISPLAY 
#   ghidra:9.1.2_PUBLIC fg Ghidra 768M "" ghidra.GhidraRun
#
FROM openjdk:16-jdk-slim-buster

LABEL maintainer="Nate Catelli <ncatelli@packetfire.org>"
LABEL description="Ghidra"

ARG UID=1000
ARG GHIDRA_RELEASE_URL="https://ghidra-sre.org/ghidra_9.1.2_PUBLIC_20200212.zip"
ENV GHIDRA_RELEASE_URL=${GHIDRA_RELEASE_URL}
ARG GHIDRA_VERSION="9.1.2_PUBLIC"
ENV GHIDRA_VERSION=${GHIDRA_VERSION}

RUN addgroup --system ghidra \
    && useradd -g ghidra -u ${UID} ghidra

RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    fontconfig \
    libxrender1 \
    libxtst6 \
    libxi6 \
    && apt-get clean && rm -rf /var/lib/apt/lists/

# Get, configure and install Ghidra
RUN cd /opt/ \
    && curl -o ghidra_${GHIDRA_VERSION}.zip ${GHIDRA_RELEASE_URL} \
    && unzip ghidra_${GHIDRA_VERSION}.zip \
    && rm ghidra_${GHIDRA_VERSION}.zip \
    && ls -lah \
    && mv ghidra_${GHIDRA_VERSION} ghidra \
    && chown -R ghidra /opt/ghidra

USER ghidra
WORKDIR /home/ghidra

ENTRYPOINT [ "/opt/ghidra/support/launch.sh" ]
