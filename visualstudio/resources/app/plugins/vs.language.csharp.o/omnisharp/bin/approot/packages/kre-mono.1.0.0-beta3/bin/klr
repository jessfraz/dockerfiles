#!/bin/bash

SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"

if [ -f "$DIR/mono" ]; then
  exec "$DIR/mono" $MONO_OPTIONS "$DIR/kre.mono.managed.dll" "$@"
else
  exec mono $MONO_OPTIONS "$DIR/kre.mono.managed.dll" "$@"
fi
