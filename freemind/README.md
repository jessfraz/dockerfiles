![FreeMind logo](https://cldup.com/7rBlZKgZ3u-3000x3000.png)
### FreeMind (v1.0.1 Beta 2) - free mind mapping software in Docker container. This image uses X11 socket.

Requirements:
---
- [Docker](https://github.com/docker/docker)
- xhost (may be needed on some Linux distros)

How to:
---
- Build image  
`docker build -t freemind .`  
**or**  
- Pull image from Docker Registry  
`docker pull loadaverage/freemind`
- Allow access to X server (for some Linux distros)  
`xhost local:freemind`
- Run own FreeMind image

 ```bash
docker run --rm \
      -v ~/Downloads/freemind:/home/freemind/Downloads \
      -v ~/.freemind:/home/freemind/.freemind/ \
      -v ~/.themes:/home/freemind/.themes:ro \
      -v ~/.fonts:/home/freemind/.fonts:ro \
      -v ~/.icons:/home/freemind/.icons:ro \
      -v /usr/share/themes:/usr/share/themes:ro \
      -v /usr/share/fonts:/usr/share/fonts:ro \
      -v /tmp/.X11-unix:/tmp/.X11-unix \
      -e DISPLAY=$DISPLAY freemind
```
**NOTE:** mounted config directories should have correct permissions, otherwise Freemind will not work properly.  
For example:

 ```bash
mkdir ~/.freemind && chmod 777 ~/.freemind
```
- Run FreeMind image from Docker Registry  
```bash
docker run --rm \
      -v ~/Downloads/freemind:/home/freemind/Downloads \
      -v ~/.freemind:/home/freemind/.freemind/ \
      -v ~/.themes:/home/freemind/.themes:ro \
      -v ~/.fonts:/home/freemind/.fonts:ro \
      -v ~/.icons:/home/freemind/.icons:ro \
      -v /usr/share/themes:/usr/share/themes:ro \
      -v /usr/share/fonts:/usr/share/fonts:ro \
      -v /tmp/.X11-unix:/tmp/.X11-unix \
      -e DISPLAY=$DISPLAY loadaverage/freemind
```
