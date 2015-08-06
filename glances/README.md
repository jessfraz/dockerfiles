Glances - An eye on your system
================================

[Glances](https://github.com/nicolargo/glances) is a cross-platform
curses-based system monitoring tool written in Python.

### Run in a container

For the standalone mode, just run:
```
$ docker run --rm -it --pid=host --ipc=host --net=host --privileged infoslack/glances
```

### Using

For the Web server mode, run:
```
$ glances -w
```
and enter the URL `http://<ip>:61208` in your favorite web browser.

For the client/server mode, run:
```
$ glances -s
```
on the server side and run:
```
$ glances -c <ip>
```
on the client one.
