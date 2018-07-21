#!/bin/bash
set -e
set -o pipefail

rake db:setup

exec "$@"
