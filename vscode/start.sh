#!/bin/bash
set -e
set -o pipefail

VSCODE_COMMAND=/usr/bin/code
if [[ ! -f "${VSCODE_COMMAND}" ]]; then
	>&2 echo "${VSCODE_COMMAND} does not exist"
	exit 1
fi
su user -c "${VSCODE_COMMAND}"
sleep infinity
