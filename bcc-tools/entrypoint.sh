#!/bin/bash
set -e
set -o pipefail

mount -t debugfs none /sys/kernel/debug/
exec "$@"
