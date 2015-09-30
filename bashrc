#!/bin/bash

command_not_found_handle () {
	# Check if there is a container image with that name
	if ! docker inspect --format '{{ .Author }}' "$1" >&/dev/null; then
		echo "$0: $1: command not found"
		return
	fi

	# Check that it's really the name of the image, not a prefix
	if docker inspect --format '{{ .Id }}' "$1" | grep -q "^$1" ;then
		echo "$0: $1: command not found"
		return
	fi

	# Add a bunch of (optional) devices
	# (Don't add them unconditionally: if they don't exist, it
	# would prevent the container from starting)
	DEVICES=
	for DEV in /dev/kvm /dev/ttyUSB* /dev/dri/* /dev/snd/*; do
		if [ -b "$DEV" -o -c "$DEV" ]; then
			DEVICES="$DEVICES --device $DEV:$DEV"
		fi
	done

	# And a few (optional) files
	# (Here again, they don't always exist everywhere)
	VOLUMES=
	for VOL in /tmp/.X11-unix /run/user; do
		if [ -e "$VOL" ]; then
			VOLUMES="$VOLUMES --volume $VOL:$VOL"
		fi
	done

	# Check if we are on a tty to decide whether to allocate one
	DASHT=
	tty -s && DASHT=-t

	docker run $DASHT -i -u $(whoami) -w "$HOME" \
		$(env | cut -d= -f1 | awk '{print "-e", $1}') \
		$DOCKERFILES_RUN_FLAGS $DEVICES $VOLUMES \
		-v /etc/passwd:/etc/passwd:ro \
		-v /etc/group:/etc/group:ro \
		-v /etc/localtime:/etc/localtime:ro \
		-v /home:/home \
		"$@"
}
