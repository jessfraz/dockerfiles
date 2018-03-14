#!/bin/bash
set -e
set -o pipefail

mkdir -p "${HOME}/rootfs"
mkdir -p "${HOME}/containerroot"

# untar the rootfs
tar -C "${HOME}/rootfs" -xf "${HOME}/busybox.tar"

# create the spec
runc spec --rootless

# run the container
runc --root "${HOME}/containerroot" run mycontainer
