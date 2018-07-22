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

	local resp=$(curl -sSL -H "${AUTH_HEADER}" -H "${API_HEADER}" "${URI}/repos/${repo}/releases")
	local tag=$(echo $resp | jq -e --raw-output .[0].tag_name)
	local name=$(echo $resp | jq -e --raw-output .[0].name)

	if [[ "$tag" == "null" ]]; then
		# get the latest tag
		local resp=$(curl -sSL -H "${AUTH_HEADER}" -H "${API_HEADER}" "${URI}/repos/${repo}/tags")
		local tag=$(echo $resp | jq -e --raw-output .[0].name)
		tag=${tag#release-}
	fi

	if [[ "$name" == "null" ]] || [[ "$name" == "" ]]; then
		name="-"
	fi

	local dir=${repo#*/}

	if [[ "$dir" == "CouchPotatoServer" ]]; then
		dir="couchpotato"
	elif [[ "$dir" == "cri-o" ]]; then
		dir="crio"
	elif [[ "$dir" == "byte-unixbench" ]]; then
		dir="unixbench"
	elif [[ "$dir" == "Tautulli" ]]; then
		dir="plexpy"
	elif [[ "$dir" == "zookeeper" ]]; then
		dir="zookeeper/3.5"
	elif [[ "$dir" == "oauth2_proxy" ]]; then
		dir="oauth2-proxy"
	elif [[ "$dir" == "wireguard" ]]; then
		dir="wireguard/install"
	fi

	# Change to upper case for grep
	local udir=$(echo $dir | awk '{print toupper($0)}')
	# Replace dashes (-) with underscores (_)
	udir=${udir//-/_}
	udir=${udir%/*}

	local current
	if [[ ! -d "$dir" ]]; then
		# If the directory does not exist, then grep all for it
		current=$(grep -m 1 "${udir}_VERSION"  **/Dockerfile | head -n 1 | awk '{print $(NF)}')
	else
		current=$(cat "${dir}/Dockerfile" | grep -m 1 "${udir}_VERSION" | awk '{print $(NF)}')
	fi


	compare "$name" "$dir" "$tag" "$current" "https://github.com/${repo}/releases"
}

get_latest_unifi() {
	local latest current
	latest=$(curl -sSL http://www.ubnt.com/downloads/unifi/debian/dists/cloudkey-stable/ubiquiti/binary-armhf/Packages \
		| awk 'BEGIN {FS="\n"; RS="";} /^Package: unifi/' \
		| awk '/^Version:/ {print $2}' \
		| cut -d- -f1)

	current=$(grep -m 1 UNIFI_VERSION unifi/Dockerfile | tr '"' ' ' | awk '{print $(NF)}')

	compare unifi unifi "$latest" "$current" https://www.ubnt.com/download/unifi
}

compare() {
	local name="$1" dir="$2" tag="$3" current="$4" releases="$5"

	if [[ "$tag" =~ "$current" ]] || [[ "$name" =~ "$current" ]] || [[ "$current" =~ "$tag" ]] || [[ "$current" == "master" ]]; then
		echo -e "\e[36m${dir}:\e[39m current ${current} | ${tag} | ${name}"
	else
		# add to the bad versions
		if [[ "$dir" != "rstudio" ]] && [[ "$dir" != "bazel" ]] && [[ "$dir" != "mc" ]]; then
			bad_versions+=( "${dir}" )
		fi
		echo -e "\e[31m${dir}:\e[39m current ${current} | ${tag} | ${name} | ${releases}"
	fi
}

projects=(
noelbundick/azure-cli-extension-noelbundick
browsh-org/browsh
certbot/certbot
hashicorp/consul
coredns/coredns
CouchPotato/CouchPotatoServer
curl/curl
kolide/fleet
GoogleCloudPlatform/cloud-sdk-docker
google/gitiles
bazelbuild/bazel
google/guetzli
irssi/irssi
cryptodotis/irssi-otr
keepassxreboot/keepassxc
robertdavidgraham/masscan
MidnightCommander/mc
zyedidia/micro
nzbget/nzbget
bitly/oauth2_proxy
facebook/osquery
Tautulli/Tautulli
perkeep/perkeep
powershell/powershell
Radarr/Radarr
cesanta/docker_auth
ricochet-im/ricochet
reverse-shell/routersploit
rstudio/rstudio
tarsnap/tarsnap
fcambus/telize
nginx/nginx
simplresty/ngx_devel_kit
openresty/lua-nginx-module
leev/ngx_http_geoip2_module
maxmind/libmaxminddb
hashicorp/terraform
kdlucas/byte-unixbench
mitchellh/vagrant
hashicorp/vault
v2tec/watchtower
wireguard/wireguard
znc/znc
apache/zookeeper
)

other_projects=(
unifi
)

bad_versions=()

main() {
	for p in ${projects[@]}; do
		get_latest "$p"
	done
	for p in ${other_projects[@]}; do
		get_latest_"$p"
	done

	if [[ ${#bad_versions[@]} -ne 0 ]]; then
		echo
		echo "These Dockerfiles are not up to date: ${bad_versions[@]}" >&2
		exit 1
	fi
}

main
