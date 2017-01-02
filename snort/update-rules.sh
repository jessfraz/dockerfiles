#! /bin/bash
#
# Wrapper script around pulledpork to update rules.
set -e
set -o pipefail

PULLEDPORK_CONF="/usr/src/pulledpork/etc/pulledpork.conf"
ENABLESID_CONF="/usr/src/pulledpork/etc/enablesid.conf"
DISABLESID_CONF="/usr/src/pulledpork/etc/disablesid.conf"
DROPSID_CONF="/usr/src/pulledpork/etc/dropsid.conf"
MODIFYSID_CONF="/usr/src/pulledpork/etc/modifysid.conf"

BLACKLIST_URL="http://www.talosintelligence.com/feeds/ip-filter.blf"
mkdir -p /usr/local/etc/snort/rules/iplists

VRT_RULE_URL="https://www.snort.org/rules/|snortrules-snapshot.tar.gz"
ET_OPEN_RULE_URL="https://rules.emergingthreatspro.com/|emerging.rules.tar.gz"

PP_ARGS="/usr/src/pulledpork/pulledpork.pl -c ${PULLEDPORK_CONF} -P"
PP_ARGS="${PP_ARGS} -u ${BLACKLIST_URL}|IPBLACKLIST|open"

check_for_file() {
	echo -n "Checking for file $1: "
	if [[ -e "$1" ]]; then
		echo "found."
		return 0
	else
		echo "not found."
		return 1
	fi
}

if [[ -z "${OINKCODE}" ]]; then
	echo "warning: OINKCODE variable not set: using ET open rules."
	RULE_URL=${ET_OPEN_RULE_URL}
	OINKCODE="open"
else
	RULE_URL=${VRT_RULE_URL}
fi
PP_ARGS="${PP_ARGS} -u ${RULE_URL}|${OINKCODE}"

if check_for_file ${ENABLESID_CONF}; then
	PP_ARGS="${PP_ARGS} -e ${ENABLESID_CONF}"
fi

if check_for_file ${DISABLESID_CONF}; then
	PP_ARGS="${PP_ARGS} -i ${DISABLESID_CONF}"
fi

if check_for_file ${DROPSID_CONF}; then
	PP_ARGS="${PP_ARGS} -b ${DROPSID_CONF}"
fi

if check_for_file ${MODIFYSID_CONF}; then
	PP_ARGS="${PP_ARGS} -M ${MODIFYSID_CONF}"
fi

echo "Running ${PP_ARGS}."
${PP_ARGS}
