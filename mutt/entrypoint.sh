#!/bin/sh
set -e

if [ -z "$GMAIL" ]; then
	echo >&2 'error: missing GMAIL environment variable'
	echo >&2 '  try running again with -e GMAIL=your-email@gmail.com'
	echo >&2 '    optionally, you can also specify -e GMAIL_PASS'
	echo >&2 '    -e GMAIL_NAME="Your Name" and GMAIL_FROM=email@your-domain.com'
	echo >&2 '      if not specified, both default to the value of GMAIL'
	exit 1
fi

if [ -z "$GMAIL_NAME" ]; then
	GMAIL_NAME="$GMAIL"
fi

if [ -z "$GMAIL_FROM" ]; then
	GMAIL_FROM="$GMAIL"
fi

if [ -z "$IMAP_SERVER" ]; then
	IMAP_SERVER="imap.gmail.com:993"
fi

if [ -z "$SMTP_SERVER" ]; then
	SMTP_SERVER="smtp.gmail.com"
fi

sed -i "s/%GMAIL_LOGIN%/$GMAIL/g"       "$HOME/.mutt/muttrc"
sed -i "s/%GMAIL_NAME%/$GMAIL_NAME/g"   "$HOME/.mutt/muttrc"
sed -i "s/%GMAIL_PASS%/$GMAIL_PASS/g"   "$HOME/.mutt/muttrc"
sed -i "s/%GMAIL_FROM%/$GMAIL_FROM/g"   "$HOME/.mutt/muttrc"
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
