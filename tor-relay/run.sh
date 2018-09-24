#!/bin/bash
set -e
set -o pipefail

for relaytype in bridge middle exit; do
	file="/etc/tor/torrc.${relaytype}"

	sed -i "s/RELAY_NICKNAME/${RELAY_NICKNAME}/g" "$file"
	sed -i "s/CONTACT_GPG_FINGERPRINT/${CONTACT_GPG_FINGERPRINT}/g" "$file"
	sed -i "s/CONTACT_NAME/${CONTACT_NAME}/g" "$file"
	sed -i "s/CONTACT_EMAIL/${CONTACT_EMAIL}/g" "$file"
	sed -i "s/RELAY_BANDWIDTH_RATE/${RELAY_BANDWIDTH_RATE}/g" "$file"
	sed -i "s/RELAY_BANDWIDTH_BURST/${RELAY_BANDWIDTH_BURST}/g" "$file"
	sed -i "s/RELAY_PORT/${RELAY_PORT}/g" "$file"
done

exec tor -f "/etc/tor/torrc.${RELAY_TYPE}"
