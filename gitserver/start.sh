#!/bin/bash
set -e
set -o pipefail

[ "$DEBUG" == 'true' ] && set -x

DAEMON=sshd
HOSTKEY=/etc/ssh/ssh_host_ed25519_key

# create the host key if not already created
if [[ ! -f "${HOSTKEY}" ]]; then
	ssh-keygen -A
fi

mkdir -p "${HOME}/.ssh"
# shellcheck disable=SC1091
source /etc/profile
[ "$PUBKEY" ] && echo "$PUBKEY" > "${HOME}/.ssh/authorized_keys"

chown -R git:git "${HOME}"
chmod -R 755 "${HOME}"

# Fix permissions, if writable
if [[ -w "${HOME}/.ssh" ]]; then
    chown git:git "${HOME}/.ssh" && chmod 700 "${HOME}/.ssh/"
fi
if [[ -w "${HOME}/.ssh/authorized_keys" ]]; then
    chown git:git "${HOME}/.ssh/authorized_keys"
    chmod 600 "${HOME}/.ssh/authorized_keys"
fi

# Warn if no config
if [[ ! -e "${HOME}/.ssh/authorized_keys" ]]; then
  echo "WARNING: No SSH authorized_keys found for git"
fi

# set the default shell
mkdir -p "${HOME}/git-shell-commands"
cat > "${HOME}/git-shell-commands/no-interactive-login" <<\EOF
#!/bin/sh
printf '%s\n' "Hi $USER! You've successfully authenticated, but I do not"
printf '%s\n' "provide interactive shell access."
exit 128
EOF
chmod +x "${HOME}/git-shell-commands/no-interactive-login"

stop() {
    echo "Received SIGINT or SIGTERM. Shutting down $DAEMON"
    # Get PID
    pid=$(cat "/var/run/${DAEMON}/${DAEMON}.pid")
    # Set TERM
    kill -SIGTERM "${pid}"
    # Wait for exit
    wait "${pid}"
    # All done.
    echo "Done."
}

# shellcheck disable=SC2145
echo "Running $@"
if [[ "$(basename "$1")" == "$DAEMON" ]]; then
    trap stop SIGINT SIGTERM
	# shellcheck disable=SC2068
    $@ &
    pid="$!"
    mkdir -p "/var/run/${DAEMON}" && echo "${pid}" > "/var/run/${DAEMON}/${DAEMON}.pid"
    wait "${pid}" && exit $?
else
    exec "$@"
fi
