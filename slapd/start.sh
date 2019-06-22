#!/bin/bash
set -e
set -o pipefail

: LDAP_ROOTPASS="${LDAP_ROOTPASS}"
: LDAP_DOMAIN="${LDAP_DOMAIN}"
: LDAP_ORGANIZATION="${LDAP_ORGANIZATION}"

if [ ! -e /var/lib/ldap/docker_bootstrapped ]; then
  echo "configuring slapd for first run"

  cat <<EOF | debconf-set-selections
slapd slapd/internal/generated_adminpw password ${LDAP_ROOTPASS}
slapd slapd/internal/adminpw password ${LDAP_ROOTPASS}
slapd slapd/password2 password ${LDAP_ROOTPASS}
slapd slapd/password1 password ${LDAP_ROOTPASS}
slapd slapd/dump_database_destdir string /var/backups/slapd-VERSION
slapd slapd/domain string ${LDAP_DOMAIN}
slapd shared/organization string ${LDAP_ORGANIZATION}
slapd slapd/backend string HDB
slapd slapd/purge_database boolean true
slapd slapd/move_old_database boolean true
slapd slapd/allow_ldap_v2 boolean false
slapd slapd/no_configuration boolean false
slapd slapd/dump_database select when needed
EOF

  dpkg-reconfigure -f noninteractive slapd

  touch /var/lib/ldap/docker_bootstrapped
else
  echo "found already-configured slapd"
fi

exec /usr/sbin/slapd -h "ldap:///" -u openldap -g openldap -d 0
