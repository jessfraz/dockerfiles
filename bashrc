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

	docker run -ti -u $(whoami) -w "$HOME" \
		$(env | cut -d= -f1 | awk '{print "-e", $1}') \
		-v /dev/snd:/dev/snd \
		-v /etc/passwd:/etc/passwd:ro \
		-v /etc/group:/etc/group:ro \
		-v /etc/localtime:/etc/localtime:ro \
		-v /home:/home \
		-v /tmp/.X11-unix:/tmp/.X11-unix \
		"$@"
}
