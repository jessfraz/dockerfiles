## dockerfiles

[![Travis CI](https://img.shields.io/travis/jessfraz/dockerfiles.svg?style=for-the-badge)](https://travis-ci.org/jessfraz/dockerfiles)

This is a repo to hold various Dockerfiles for images I create.

I try to make sure each has a command at the top for running it,
if a file you are looking at does not have a command, please
pull request it!

Almost all of these live on dockerhub under [jess](https://hub.docker.com/u/jess/).
Because you cannot use notary with autobuilds on dockerhub I also build these
continuously on a private registry at [r.j3ss.co](https://r.j3ss.co/) for public download. (You're
welcome.)

You may also want to checkout my [dotfiles](https://github.com/jessfraz/dotfiles), specifically the aliases for all these files which are here: [github.com/jessfraz/dotfiles/blob/master/.dockerfunc](https://github.com/jessfraz/dotfiles/blob/master/.dockerfunc).

#### Using the `Makefile`

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
