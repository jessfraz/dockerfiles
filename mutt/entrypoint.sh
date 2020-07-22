#!/bin/sh
set -e

if [ -z "$PMAIL" ]; then
	echo >&2 'error: missing PMAIL environment variable'
	echo >&2 '  try running again with -e PMAIL=your-email@your-domain.com'
	echo >&2 '    optionally, you can also specify -e PMAIL_PASS'
	echo >&2 '    -e PMAIL_NAME="Your Name" and PMAIL_FROM=email@your-domain.com'
	echo >&2 '      if not specified, both default to the value of PMAIL'
	exit 1
fi

if [ -z "$PMAIL_NAME" ]; then
	PMAIL_NAME="$PMAIL"
fi

if [ -z "$PMAIL_FROM" ]; then
	PMAIL_FROM="$PMAIL"
fi

# Requires ProtonMail bridge
if [ -z "$IMAP_SERVER" ]; then
	IMAP_SERVER="127.0.0.1"
fi

if [ -z "$SMTP_SERVER" ]; then
	SMTP_SERVER="127.0.0.1"
fi

sed -i "s/%PMAIL_LOGIN%/$PMAIL/g"       "$HOME/.mutt/muttrc"
sed -i "s/%PMAIL_NAME%/$PMAIL_NAME/g"   "$HOME/.mutt/muttrc"
sed -i "s/%PMAIL_PASS%/$PMAIL_PASS/g"   "$HOME/.mutt/muttrc"
sed -i "s/%PMAIL_FROM%/$PMAIL_FROM/g"   "$HOME/.mutt/muttrc"
sed -i "s/%IMAP_SERVER%/$IMAP_SERVER/g" "$HOME/.mutt/muttrc"
sed -i "s/%SMTP_SERVER%/$SMTP_SERVER/g" "$HOME/.mutt/muttrc"

if [ -d "$HOME/.gnupg" ]; then
	# sane gpg settings to be a good encryption
	# social citizen of the world
	{
		echo
		if [ -f "/etc/Muttrc.gpg.dist" ]; then
			echo 'source /etc/Muttrc.gpg.dist'
		fi
		if [ -f "/usr/share/doc/mutt/samples/gpg.rc" ]; then
			echo 'source /usr/share/doc/mutt/samples/gpg.rc'
		fi
		if [ -f "/usr/share/doc/mutt/examples/gpg.rc" ]; then
			echo 'source /usr/share/doc/mutt/examples/gpg.rc'
		fi
		if [ -n "$GPG_ID" ]; then
			echo "set pgp_sign_as = $GPG_ID"
		fi
		echo 'set crypt_replysign=yes'
		echo 'set crypt_replysignencrypted=yes'
		echo 'set crypt_verify_sig=yes'
		# auto encrypt replies to encrypted mail
		echo 'set pgp_replyencrypt=yes'
		# auto sign replies to signed mail
		echo 'set pgp_replysign=yes'
		# auto sign & encrypt to signed & encrypted mail
		echo 'set pgp_replysignencrypted=yes'
		# show which keys are no good anymore
		echo 'set pgp_show_unusable=no'
		# auto sign emails
		echo 'set pgp_autosign=yes'
	} >> "$HOME/.mutt/muttrc"
fi

if [ -e "$HOME/.muttrc.local" ]; then
	echo "source $HOME/.muttrc.local" >> "$HOME/.mutt/muttrc"
fi

exec "$@"
