#!/bin/bash
set -e

# add the correct user perms
gpasswd -a root libvirt
gpasswd -a root kvm
chown root:kvm /dev/kvm

# create the bridge for networking
ip link add name virt0 type bridge
ip link set virt0 up
bridge link
ip addr add dev virt0 192.168.66.66/24
iptables -t nat -A POSTROUTING -s 192.168.66.66/24 -j MASQUERADE

# start the virtlogd daemon
exec virtlogd --daemon &

exec $@
