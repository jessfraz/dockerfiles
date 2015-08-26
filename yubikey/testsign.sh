#!/bin/bash
set -e

pkcslib="/usr/lib/libykcs11.so"
#pkcslib="/usr/lib/x86_64-linux-gnu/opensc-pkcs11.so"

init(){
	local pcscd_running=$(ps -aux | grep [p]cscd)
	if [ -z "$pcscd_running" ]; then
		echo "starting pcscd in backgroud"
		pcscd --debug --apdu
		pcscd --hotplug
	else
		echo "pcscd is running in already: ${pcscd_running}"
	fi

	clean
}

clean(){
	# Delete Slots
	yubico-piv-tool -a delete -s 9a
	yubico-piv-tool -a delete -s 9c
	yubico-piv-tool -a delete -s 9d
	yubico-piv-tool -a delete -s 9e
}

setup(){
	cd $(mktemp -d)

	# Create some data to sign
	echo "Hello World!" > in.txt
}

9a1024sha1() {
	(
	setup

	# Generate a key in slot 9a
	pkcs11-tool --module $pkcslib -k --key-type rsa:1024 -l --login-type so --so-pin 010203040506070801020304050607080102030405060708 -d 0

	# Extract the certificate with the public key
	yubico-piv-tool -a read -s 9a > 9a.pem

	# Extract the public key from the certificate
	openssl x509 -pubkey -noout -in 9a.pem > pubkey9a.pem

	# Sign the data using sha1WithRSA
	pkcs11-tool --module $pkcslib -s -l -p 123456 -d 0 -m SHA1-RSA-PKCS -o sign9a.dat -i in.txt

	# Verify the signature
	openssl dgst -sha1 -verify pubkey9a.pem -signature sign9a.dat in.txt
	)
}

9e2048sha256() {
	(
	setup

	# Generate a key in slot 9e
	pkcs11-tool --module $pkcslib -k --key-type rsa:2048 -l --login-type so --so-pin 010203040506070801020304050607080102030405060708 -d 1

	# Extract the certificate with the public key
	yubico-piv-tool -a read -s 9e > 9e.pem

	# Extract the public key from the certificate
	openssl x509 -pubkey -noout -in 9e.pem > pubkey9e.pem

	# Sign the data using sha256WithRSA
	pkcs11-tool --module $pkcslib -s -l -p 123456 -d 1 -m SHA256-RSA-PKCS -o sign9e.dat -i in.txt

	# Verify the signature
	openssl dgst -sha256 -verify pubkey9e.pem -signature sign9e.dat in.txt
	)
}

9c256sha1() {
	(
	setup

	# Generate a key in slot 9c
	pkcs11-tool --module $pkcslib -k --key-type EC:prime256v1 -l --login-type so --so-pin 010203040506070801020304050607080102030405060708 -d 2

	# Extract the certificate with the public key
	yubico-piv-tool -a read -s 9c > 9c.pem

	# Extract the public key from the certificate
	openssl x509 -pubkey -noout -in 9c.pem > pubkey9c.pem

	# Sign the data using sha256WithECDSA
	pkcs11-tool --module $pkcslib -s -l -p 123456 -d 2 -m ECDSA-SHA1 -o sign9c.dat -i in.txt

	# Verify the signature
	openssl dgst -ecdsa-with-SHA1 -verify pubkey9c.pem -signature sign9c.dat in.txt
	)
}

init

9a1024sha1
9e2048sha256
9c256sha1
