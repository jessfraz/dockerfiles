#!/bin/bash
set -e
set -o pipefail

handle_signal() {
  PID=$!
  echo "Received signal. PID is ${PID}"
  kill -s SIGHUP $PID
}

trap "handle_signal" SIGINT SIGTERM SIGHUP

echo "Starting sonarr..."
exec mono --debug /opt/sonarr/NzbDrone.exe --no-browser -data=/config & wait
echo "Stopping sonarr..."
