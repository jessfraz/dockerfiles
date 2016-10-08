# This script gets the latest GitHub releases for the specified projects.
#!/bin/bash
set -e

if [[ -z "$GITHUB_TOKEN" ]]; then
	echo "Set the GITHUB_TOKEN env variable."
	exit 1
fi

URI=https://api.github.com
API_VERSION=v3
API_HEADER="Accept: application/vnd.github.${API_VERSION}+json"
AUTH_HEADER="Authorization: token ${GITHUB_TOKEN}"

get_latest() {
	local repo=$1

	local resp=$(curl -sSL -H "${AUTH_HEADER}" -H "${API_HEADER}" "${URI}/repos/${repo}/releases/latest")
	local tag=$(echo $resp | jq --raw-output .tag_name)
	local name=$(echo $resp | jq --raw-output .name)

	if [[ "$tag" == "null" ]]; then
		# get the latest tag
		local resp=$(curl -sSL -H "${AUTH_HEADER}" -H "${API_HEADER}" "${URI}/repos/${repo}/tags")
		local tag=$(echo $resp | jq --raw-output .[0].name)
	fi

	local dir=${repo#*/}
	local current=$(cat "${dir}/Dockerfile" | grep -m 1 VERSION | awk '{print $(NF)}')

	if [[ "$tag" =~ "$current" ]]; then
		echo -e "\e[36m${dir}:\e[39m current ${current} | ${tag} | ${name}"
	else
		echo -e "\e[31m${dir}:\e[39m current ${current} | ${tag} | ${name} | https://github.com/${repo}/releases"
	fi
}

projects=(
apache/zookeeper
atom/atom
camlistore/camlistore
curl/curl
hashicorp/consul
hashicorp/vault
irssi/irssi
JonnyWong16/plexpy
microsoft/vscode
mitchellh/vagrant
pooler/cpuminer
powershell/powershell
reverse-shell/routersploit
ricochet-im/ricochet
tarsnap/tarsnap
znc/znc
zyedidia/micro
)

main() {
	for p in ${projects[@]}; do
		get_latest "$p"
	done
}

main
