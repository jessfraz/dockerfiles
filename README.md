# Dockerfiles 🐳

This is a repo to hold various Dockerfiles for images I create.

[![Travis CI](https://img.shields.io/travis/jessfraz/dockerfiles.svg?style=for-the-badge)](https://travis-ci.org/jessfraz/dockerfiles)

Almost all of these live on dockerhub under [jess](https://hub.docker.com/u/jess/).

Because you cannot use notary with autobuilds on dockerhub I also build these continuously on a private registry at [r.j3ss.co](https://r.j3ss.co/) for public download. (You're welcome.)

## Index

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Resources](#resources)
  - [My dotfiles](#my-dotfiles)
- [Using the `Makefile`](#using-the-makefile)
- [Contributing](#contributing)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Resources

### My dotfiles

You may also want to cMarkdown TOCthub.com/jessfraz/dotfiles/blob/master/.dockerfunc).

## Using the `Makefile`

```bash
$ make help
build                          Builds all the dockerfiles in the repository.
dockerfiles                    Tests the changes to the Dockerfiles build.
image                          Build a Dockerfile (ex. DIR=telnet).
latest-versions                Checks all the latest versions of the Dockerfile contents.
run                            Run a Dockerfile from the command at the top of the file (ex. DIR=telnet).
shellcheck                     Runs the shellcheck tests on the scripts.
test                           Runs the tests on the repository.
```

## Contributing

I try to make sure each Dockerfile has a command at the top to document running it,
if a file you are looking at does not have a command, please
pull request it!

## License

This repository is licensed under [MIT License](LICENSE)

Copyright (c) 2017 [Jessie Frazelle](https://github.com/jessfraz)
