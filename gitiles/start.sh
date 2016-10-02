#!/bin/sh
set -e

ROOT=/gitiles
PROPERTIES=

if [ "x$1" != "x" ]; then
	PROPERTIES="-Dcom.google.gitiles.configPath=$1"
else
	PROPERTIES="-Dcom.google.gitiles.configPath=/gitfiles.config"
	cat > /gitfiles.config <<-EOF
	[gitiles]
		# Repositories placed here
		basePath = /home/git
		# Do not check they are exported
		exportAll = true
		# This URL will be displayed as clone URL. DO NOT FORGET TRAILING SLASH!
		baseGitUrl = ${BASE_GIT_URL}:
		# Title of site (doh)
		siteTitle  = Gitiles - ${SITE_TITLE}
		# I dunno why, but it is have to be configured.
		canonicalHostName = ${SITE_TITLE}
	[google]
		analyticsId = UA-${GA_ID}
	EOF
fi

PROPERTIES="$PROPERTIES -Dcom.google.gitiles.sourcePath=$ROOT"

exec java $PROPERTIES -jar "$ROOT/buck-out/gen/gitiles-dev/dev.jar"
