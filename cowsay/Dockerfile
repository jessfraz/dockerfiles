# DESCRIPTION:    cowsay game
# AUTHOR:         Bradley Massey <massey.bradley@gmail.com>
# USAGE:
#    # Build cowsay image
#    docker build -t cowsay .
#
#    docker run --rm cowsay:latest -f ghostbusters "Who you Gonna Call?"

FROM debian:buster-slim

RUN apt-get update && \
    apt-get install -y cowsay && \
    rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["/usr/games/cowsay"]
