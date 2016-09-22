## dockerfiles

[![Travis CI](https://travis-ci.org/jfrazelle/dockerfiles.svg?branch=master)](https://travis-ci.org/jfrazelle/dockerfiles)

This is a repo to hold various Dockerfiles for images I create.

I try to make sure each has a command at the top for running it,
if a file you are looking at does not have a command, please
pull request it!

Almost all of these live on dockerhub under [jess](https://hub.docker.com/u/jess/).
Because you cannot use notary with autobuilds on dockerhub I also build these
continuously on a private registry at r.j3ss.co for public download. (You're
welcome.)

You may also want to checkout my [dotfiles](https://github.com/jfrazelle/dotfiles), specifically the aliases for all these files which are here: [github.com/jfrazelle/dotfiles/blob/master/.dockerfunc](https://github.com/jfrazelle/dotfiles/blob/master/.dockerfunc).

### Running on macOS

> Note added by [Alex Ellis](https://github.com/alexellis)

It is possible to run graphical apps for Linux through Docker on your Mac - here's a few advantages:

* To access to newer versions of software
* To test various versions of the same software simultaneously
* To use tools which may not be ported to macOS yet

For sandboxing an application:
* To tighten up on security
* or to isolate and/or spy on network traffic

Follow this guide for more information:

* [Bring Linux apps to the Mac Desktop with Docker](http://blog.alexellis.io/linux-desktop-on-mac/)

**TL;DR**

* Requires XQuartz
* Set `HOST_IP` to whatever makes sense for your Mac. 
* Next bind-mount whichever directories you need such as the Downloads folder.

The script uses `socat` to accept network connections and redirect them to the private UNIX DISPLAY socket.

```
export HOST_IP=192.168.0.100
socat TCP-LISTEN:6000,reuseaddr,fork UNIX-CLIENT:\"$DISPLAY\" &
docker rm -f slack
docker run -d --name slack \
 -e DISPLAY=$HOST_IP:0 \
 -v `echo $HOME`/.slack:/root/.config/Slack \
 -v `echo $HOME`/Downloads:/root/Downloads \
 jess/slack:latest
```
