#!/bin/bash
#
# Entry point script to make sure external volumes are properly prepped.
# Expects:
#   -e INTERFACE - sniffing interface ON THE HOST
#   -e INSTANCE - the name of the per-interface instance to support multiple configs per interface
#   -e SENSOR_IP - the IP of the HOST
#   -e OPTS - additional options to pass to snort
#   -e HOMENET - to override HOME_NET setting in snort.conf
set -e
set -o pipefail

if [[ "$1" == "snort" ]]; then
	LOGDIR=/data/$INSTANCE/logs/$HOSTNAME
	[ -d $LOGDIR ] || mkdir -p $LOGDIR

	CONFDIR=/usr/src/snort/etc
	CONFIG=$CONFDIR/snort.conf
	RULES=$CONFDIR/rules

	if [[ -z "$DISABLE_PULLEDPORK" ]]; then
		/usr/local/bin/update-rules.sh
		OPTS="$OPTS -S RULES_FILE=snort.$HOSTNAME.rules"
	fi

	[[ -z "$HOMENET" ]] || OPTS="$OPTS -S HOME_NET=$HOMENET"
	[[ -z "$SENSOR_IP" ]] || OPTS="$OPTS -S SENSOR_IP=$SENSOR_IP"

	exec snort -m 027 -d -l $LOGDIR $OPTS -c $CONFIG -i $INTERFACE
fi

exec "$@"
