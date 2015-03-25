alpine-t 
=========
Docker image based on Alpine Linux ;)

### What is Alpine ?

Alpine Linux is a Linux distribution built around musl libc and BusyBox.
The image is only 5 MB in size and has access to a package repository 
that is much more complete than other BusyBox based images. 
More: [https://registry.hub.docker.com/_/alpine/](https://registry.hub.docker.com/_/alpine/)

### Why ?

Image based `ruby:latest` vs `alpine:latest`:

```
$ docker images
REPOSITORY                    TAG                 VIRTUAL SIZE
infoslack/alpine-t            latest              161.4 MB
infoslack/t                   latest              781.5 MB
```
