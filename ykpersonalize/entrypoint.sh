#!/bin/bash
set -e
set -o pipefail

init(){
	local pcscd_running
	pcscd_running=$(pgrep pcscd)
	if [ -z "$pcscd_running" ]; then
		echo "starting pcscd in backgroud"
		pcscd --debug --apdu
		pcscd --hotplug
	else
		echo "pcscd is running in already: ${pcscd_running}"
	fi
}

init

"$@"
