#!/bin/bash
# main entry point to run idonethis

function checkvars() {
    if [[ -z "${IDT_USERNAME}" ]]; then
        echo "ERROR: The environment variable IDT_USERNAME is not set."
        exit 1
    fi

    if [[ -z "${IDT_PASSWORD}" ]]; then
        echo "ERROR: The environment variable IDT_PASSWORD is not set."
        exit 1
    fi

    if [[ -z "${IDT_ADDRESS}" ]]; then
        echo "ERROR: The environment variable IDT_ADDRESS is not set."
        exit 1
    fi
}

function main() {
    checkvars

    cat <<EOT >> /.idonethisrc
username: $IDT_USERNAME
password: $IDT_PASSWORD
idonethis_address: $IDT_ADDRESS
EOT
}

main
echo "Sending message: '$@'"
idonethis "$@"