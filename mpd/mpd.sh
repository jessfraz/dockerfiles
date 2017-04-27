#!/bin/bash
set -e
set -o pipefail

mkdir -p /var/lib/mpd/{playlists,music} \
	&& touch /var/lib/mpd/{state,tag_cache} \
	&& chmod 0777 -R /var/lib/mpd \
	&& chown -R mpd /var/lib/mpd

exec mpd --no-daemon --stdout --verbose /etc/mpd.conf "$@"
