#!/bin/bash
set -e
set -o pipefail

# add the correct user perms
echo "Adding the user groups..."
gpasswd -a root libvirt
gpasswd -a root kvm
chown root:kvm /dev/kvm

# allow root user to use qemu
echo 'user = "root"' >> /etc/libvirt/qemu.conf
echo 'group = "root"' >> /etc/libvirt/qemu.conf

# create the bridge for networking
echo "Creating the bridge for networking..."
ip link add name virt0 type bridge
ip link set dev virt0 up
bridge link
ip addr add dev virt0 172.20.0.1/16
iptables -t nat -A POSTROUTING -s 172.20.0.1/16 -j MASQUERADE

# start the virtlogd daemon
echo "Starting virtlogd..."
virtlogd &

# start libvirtd
echo "Starting libvirtd..."
libvirtd &

# put in a sleep for services to start
echo "Sleeping while services start..."
sleep 5

# start the default networking
echo "Creating the default networking..."
virsh net-start default

# import existing vms
echo "Importing any existing VMs..."
for f in /root/kvm/*.xml; do
	echo "Importing $(basename "$f")..."
	virsh define "$f"
done

echo "Starting virt-manager..."
# shellcheck disable=SC2068
exec $@
