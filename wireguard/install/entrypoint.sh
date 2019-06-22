#!/bin/sh
set -e

(
cd /wireguard/src
echo "Building the wireguard kernel module..."
make module
echo "Installing the wireguard kernel module..."
make module-install
echo "Cleaning up..."
make clean
)

echo "Successfully built and installed the wireguard kernel module!"

# shellcheck disable=SC2068
exec $@
