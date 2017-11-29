#!/bin/bash
# This script gets the latest GitHub releases for the specified projects.
set -e
set -o pipefail

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
	local tag=$(echo $resp | jq -e --raw-output .tag_name)
	local name=$(echo $resp | jq -e --raw-output .name)

	if [[ "$tag" == "null" ]]; then
		# get the latest tag
		local resp=$(curl -sSL -H "${AUTH_HEADER}" -H "${API_HEADER}" "${URI}/repos/${repo}/tags")
		local tag=$(echo $resp | jq -e --raw-output .[0].name)
	fi

	if [[ "$name" == "null" ]] || [[ "$name" == "" ]]; then
		name="-"
	fi

	local dir=${repo#*/}

	if [[ "$dir" == "CouchPotatoServer" ]]; then
		dir="couchpotato"
	elif [[ "$dir" == "SoftHSMv2" ]]; then
		dir="golang-softhsm2"
	elif [[ "$dir" == "bazel" ]]; then
		dir="gitiles"
	elif [[ "$dir" == "oauth2_proxy" ]]; then
		dir="oauth2-proxy"
	fi

	local current=$(cat "${dir}/Dockerfile" | grep -m 1 VERSION | awk '{print $(NF)}')

	if [[ "$tag" =~ "$current" ]] || [[ "$name" =~ "$current" ]] || [[ "$current" =~ "$tag" ]] || [[ "$current" == "master" ]]; then
		echo -e "\e[36m${dir}:\e[39m current ${current} | ${tag} | ${name}"
	else
		if [[ "$dir" != "zookeeper" ]]; then
			bad_versions+=( "${dir}" )
		fi
		echo -e "\e[31m${dir}:\e[39m current ${current} | ${tag} | ${name} | https://github.com/${repo}/releases"
	fi
}

projects=(
atom/atom
camlistore/camlistore
certbot/certbot
hashicorp/consul
CouchPotato/CouchPotatoServer
curl/curl
google/guetzli
irssi/irssi
keepassxreboot/keepassxc
zyedidia/micro
bitly/oauth2_proxy
JonnyWong16/plexpy
powershell/powershell
ricochet-im/ricochet
reverse-shell/routersploit
tarsnap/tarsnap
fcambus/telize
hashicorp/terraform
mitchellh/vagrant
hashicorp/vault
wireguard/wireguard
znc/znc
apache/zookeeper
)

bad_versions=()

main() {
	for p in ${projects[@]}; do
		get_latest "$p"
	done

	if [[ ${#bad_versions[@]} -ne 0 ]]; then
		echo
		echo "These Dockerfiles are not up to date: ${bad_versions[@]}" >&2
		exit 1
	fi
}

main
