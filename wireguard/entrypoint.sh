#!/bin/sh
set -e

(
cd /wireguard/src
make module
make module-install
make clean
)

exec $@
