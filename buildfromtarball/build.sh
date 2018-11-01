#!/bin/bash
set -e
set -o pipefail
set -x

tarball=$1
image=$2

volume=/build

mkdir -p "$build"

curl --fail --silent --show-error --location "$tarball" | tar xvz --strip=1 -C %s 2>/dev/null) || (echo ""; printf "ERROR: %%s\n" "Could not prepare an image." "Please verify that $tarball is still available and is publicly accessible."; exit 1)

# Try to pull the image.
docker pull "$image" || true

cd "$build"

docker build --cache-from "$image" -t "$image" .

docker push "$image"
