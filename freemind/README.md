![OSM logo](https://cldup.com/7rBlZKgZ3u-3000x3000.png)
### FreeMind - free mind mapping software in Docker container. This image uses X11 sockets, not ssh/vnc.

Requirements:
---
- [Docker](https://github.com/docker/docker)
- xhost (may be needed on some Linux distros)

How to:
---
- Build image  
`docker build -t freemind .`
- Allow access to X server (for some Linux distros)  
`xhost local:root`
- Run FreeMind  

 ```bash
docker run \
  -v ~/Downloads/tmp:/tmp \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  -e DISPLAY=$DISPLAY freemind
```
