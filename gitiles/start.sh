#!/bin/sh
set -e

ROOT="/gitiles"
PROPERTIES=

if [ "x$1" != "x" ]; then
  PROPERTIES="-Dcom.google.gitiles.configPath=$1"
fi
PROPERTIES="$PROPERTIES -Dcom.google.gitiles.sourcePath=$ROOT"

exec java $PROPERTIES -jar "$ROOT/buck-out/gen/gitiles/gitiles.war"
