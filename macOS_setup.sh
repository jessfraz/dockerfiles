#!/usr/bin/env bash
# Checks for Homebrew installation and installs if not
echo "Checking for homebrew installation..."
if test ! $(which brew); then
    echo "Installing homebrew..."
    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
fi

echo "Updating homebrew recipes"
# Update homebrew recipes
brew update

# Install MacOS packages 

PACKAGES=(
    parallel
    socat
)
echo "Installing packages"
brew install ${PACKAGES[@]}
brew cleanup
