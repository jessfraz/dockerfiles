#!/bin/sh
#
# This script allows you to launch several images
# from this repository once they're built.
#
# Make sure you add the `docker run` command
# in the header of the Dockerfile so the script
# can find it and execute it.
#
# Use pulseaudio/Dockerfile and skype/Dockerfile as examples.

if [ $# -eq 0 ]; then
	echo "Usage: $0 [--test] image1 image2 ..."
	exit 1
fi

if [ "$1" = "--test" ]; then
	TEST=1
	shift
fi

for name in "$@"; do
	if [ ! -d $name ]; then
		echo "unable to find container configuration with name $name"
		exit 1
	fi

	script=`sed -n '/docker run/,/^#$/p' $name/Dockerfile | head -n -1 | sed -e 's/\#//' | sed -e 's/\\\//'`

	if [ $TEST ]; then
		echo $script
	else
		eval $script
	fi

	shift
done
