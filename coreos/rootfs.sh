#!/bin/bash
set -e

source /home/user/version.txt

for i in {0..7}; do
	if [[ ! -e /dev/loop$i ]]; then
		sudo /bin/mknod -m640 /dev/loop$i b 7 $i
		sudo /bin/chown root:disk /dev/loop$i
	else
		echo "/dev/loop$i exists"
	fi
done

(
cd /home/user/coreos
./chromite/bin/cros_sdk
exit
./chromite/bin/cros_sdk --enter
./set_shared_user_password.sh
./setup_board --default --board=amd64-usr
./build_packages
./build_image --base_dev_pkg coreos-base/coreos container
)

#XZ_OPT=-9 tar cvJf "/images/coreos-${COREOS_VERSION}.tar.xz" .
