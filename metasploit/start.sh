#!/bin/sh
set -e

if ! [ -e "/var/run/postgresql/*.pid" ]
then
    /etc/init.d/postgresql start
fi

if ! [ -e "/usr/share/metasploit-framework/config/database.yml" ]
then
    /usr/bin/msfdb init
fi

/usr/bin/msfdb start
/usr/bin/msfconsole
