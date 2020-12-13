# Run slapd in a docker container
#
# - `LDAP_DOMAIN` sets the LDAP root domain. (e.g. if you provide `foo.bar.com`
# 	here, the root of your directory will be `dc=foo,dc=bar,dc=com`)
# - `LDAP_ORGANIZATION` sets the human-readable name for your organization (e.g.
# 	`Acme Widgets Inc.`)
# - `LDAP_ROOTPASS` sets the LDAP admin user password (i.e. the password for
# 	`cn=admin,dc=example,dc=com` if your domain was `example.com`)
#
# How to start the container:
#
# docker run -v /data/ldap:/var/lib/ldap \
# 	-e LDAP_DOMAIN=authy.auth.co \
# 	-e LDAP_ORGANISATION="E Corp" \
# 	-e LDAP_ROOTPASS=fsociety \
# 	-d jess/slapd
#
# You can load an LDIF file (to set up your directory) like so:
#
# docker exec -it your_container ldapadd \
# 	-h localhost -p <host_port_of_container> -c -x \
# 	-D cn=admin,dc=mycorp,dc=com -W -f data.ldif
#
# Be aware that by default the LDAP port is accessible from anywhere if the \
# host firewall is unconfigured.
#
FROM debian:bullseye-slim
LABEL maintainer "Jessie Frazelle <jess@linux.com>"

RUN apt-get update && LC_ALL=C DEBIAN_FRONTEND=noninteractive \
	apt-get install -y \
	ldap-utils \
	slapd \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

# Just some default values for fun!
ENV LDAP_ROOTPASS=fsociety LDAP_ORGANIZATION="E CORP" LDAP_DOMAIN=mr.robot.com

COPY start.sh /start.sh

ENTRYPOINT [ "/start.sh" ]
