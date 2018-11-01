#!/bin/bash
set -e
set -o pipefail
set -x

tarball=$1
image=$2

volume=/build

mkdir -p "$volume"

(curl --fail --silent --show-error --location "$tarball" | tar xvz --strip=1 -C "$volume" 2>/dev/null) || (echo ""; echo "ERROR: Could not prepare an image.";echo "Please verify that $tarball is still available and is publicly accessible."; exit 1;)

# Try to pull the image.
docker pull "$image" || true

cd "$volume"

docker build --cache-from "$image" -t "$image" .

docker push "$image"
