#!/bin/bash
set -e
if [ -z ${NEWUSER+x} ]; then
	echo 'WARN: No user was defined, defaulting to root.'
	echo 'WARN: Sublime will save files as root:root.'
	echo '      To prevent this, start the container with -e NEWUSER=$USER'
	/usr/src/sublime_text/sublime_text -w
else
	# The root user already exists, so we only need to do something if
	# a user has been specified.
	useradd -s /bin/bash $NEWUSER
	# If you'd like to have Sublime Text add your development folder
	# to the current project (i.e. in the sidebar at start), append
	# "-a /home/$NEWUSER/Documents" (without quotes) into the su -c command below.
	# Example: su $NEWUSER -c "/usr/src/sublime_text/sublime_text -w -a /home/$NEWUSER/Documents"
	su $NEWUSER -c "/usr/src/sublime_text/sublime_text -w"
fi
