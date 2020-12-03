## dockerfiles

[![make test](https://github.com/jessfraz/dockerfiles/workflows/make%20test/badge.svg)](https://github.com/jessfraz/dockerfiles/actions?query=workflow%3A%22make+test%22+branch%3Amaster)

This is a repo to hold various Dockerfiles for images I create.


**Table of Contents**

<!-- toc -->

- [About](#about)
- [Resources](#resources)
  * [My dotfiles](#my-dotfiles)
- [Contributing](#contributing)
  * [Using the `Makefile`](#using-the-makefile)

<!-- tocstop -->

## About

Almost all of these live on dockerhub under [jess](https://hub.docker.com/u/jess/).
Because you cannot use notary with autobuilds on dockerhub I also build these
continuously on a private registry at [r.j3ss.co](https://r.j3ss.co/) for public download. (You're
welcome.)

## Resources

### My dotfiles

You may also want to checkout my [dotfiles](https://github.com/jessfraz/dotfiles), specifically the aliases for all these files which are here: [github.com/jessfraz/dotfiles/blob/master/.dockerfunc](https://github.com/jessfraz/dotfiles/blob/master/.dockerfunc).

## Contributing

I try to make sure each Dockerfile has a command at the top to document running it,
if a file you are looking at does not have a command, please
pull request it!


### Using the `Makefile`

```
$ make help
build                          Builds all the dockerfiles in the repository.
dockerfiles                    Tests the changes to the Dockerfiles build.
image                          Build a Dockerfile (ex. DIR=telnet).
latest-versions                Checks all the latest versions of the Dockerfile contents.
run                            Run a Dockerfile from the command at the top of the file (ex. DIR=telnet).
shellcheck                     Runs the shellcheck tests on the scripts.
test                           Runs the tests on the repository.
```
