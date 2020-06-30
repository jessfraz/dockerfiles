FROM debian:testing-slim
LABEL maintainer "Jeffrey Serio <serio.jeffrey@gmail.com>"

RUN apt update \
    && apt install -y nmap --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENTRYPOINT [ "nmap" ]
