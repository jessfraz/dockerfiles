#!/bin/bash

set -e

CERT_IMAGE="debian:latest"

# cd to the current directory so the script can be run from anywhere.
cd `dirname $0`

# Update the cert image.
docker pull $CERT_IMAGE

# Fetch the latest certificates.
ID=$(docker run -d $CERT_IMAGE bash -c "apt-get update && apt-get install -y --no-install-recommends ca-certificates")
docker logs -f $ID
docker wait $ID

# Update the local certificates.
docker cp $ID:/etc/ssl/certs/ca-certificates.crt .

# Cleanup.
docker rm -f $ID
