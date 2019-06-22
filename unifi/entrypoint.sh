#!/bin/bash
set -e
set -o pipefail

# Create the folder heirarchy.
mkdir -p /config/{data,logs,run}

# Create symlinks for the config
if [[ -L /usr/lib/unifi/data && ! /usr/lib/unifi/data -ef /config/data ]]; then
	unlink /usr/lib/unifi/data
fi
if [[ -L /usr/lib/unifi/logs && ! /usr/lib/unifi/logs -ef /config/logs ]]; then
	unlink /usr/lib/unifi/logs
fi
if [[ -L /usr/lib/unifi/run && ! /usr/lib/unifi/run -ef /config/run ]]; then
	unlink /usr/lib/unifi/run
fi
if [[ ! -L /usr/lib/unifi/data ]]; then
	ln -s /config/data /usr/lib/unifi/data
fi
if [[ ! -L /usr/lib/unifi/logs ]]; then
	ln -s /config/logs /usr/lib/unifi/logs
fi
if [[ ! -L /usr/lib/unifi/run ]]; then
	ln -s /config/run /usr/lib/unifi/run
fi

# Generate a key if it doesn't exist.
if [[ ! -f /config/data/keystore ]]; then
	keytool -genkey -keyalg RSA -alias unifi -keystore /config/data/keystore \
		-storepass aircontrolenterprise -keypass aircontrolenterprise -validity 1825 \
		-keysize 4096 -dname "cn=unifi"
fi

chown -R unifi:unifi /config /usr/lib/unifi

# shellcheck disable=SC2068
exec gosu unifi $@
