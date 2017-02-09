![Pencil](https://cldup.com/63hb_S0bDS.png)
### Pencil V3 in Docker container. This image uses X11 socket.
#### An open-source GUI prototyping tool that's available for ALL platforms (https://github.com/evolus/pencil)



Requirements:
---
- [Docker](https://github.com/docker/docker)
- xhost (may be needed on some Linux distros)

How to:
---
- Build image  
```bash
git clone https://github.com/loadaverage/pencil.git && cd pencil && docker build -t pencil .
```   
**or**  
- Pull image from Docker Registry  
`docker pull loadaverage/pencil`
- Allow access to X server (for some Linux distros)  
`xhost local:pencil`
- Run own Pencil image

 ```bash
    docker run --rm \
      -v ~/Downloads/pencil:/home/pencil/Downloads \
      -v ~/.pencil:/home/pencil/.pencil \
      -v ~/.config/Pencil:/home/pencil/.config/Pencil \
      -v ~/.themes:/home/pencil/.themes:ro \
      -v ~/.fonts:/home/pencil/.fonts:ro \
      -v ~/.icons:/home/pencil/.icons:ro \
      -v ~/.gtkrc-2.0:/home/pencil/.gtkrc-2.0:ro \
      -v /usr/share/themes:/usr/share/themes:ro \
      -v /usr/share/fonts:/usr/share/fonts:ro \
      -e DISPLAY=$DISPLAY pencil
```
**NOTE:** mounted config directories should have correct permissions, otherwise Pencil will not start   
For example:
 ```bash
 mkdir ~/.pencil && chmod 777 ~/.pencil
 mkdir ~/.config/Pencil && chmod 777 ~/.config/Pencil
```

- Run Pencil image from Docker registry   

 ```bash
    docker run --rm \
      -v ~/Downloads/pencil:/home/pencil/Downloads \
      -v ~/.pencil:/home/pencil/.pencil \
      -v ~/.config/Pencil:/home/pencil/.config/Pencil \
      -v ~/.themes:/home/pencil/.themes:ro \
      -v ~/.fonts:/home/pencil/.fonts:ro \
      -v ~/.icons:/home/pencil/.icons:ro \
      -v ~/.gtkrc-2.0:/home/pencil/.gtkrc-2.0:ro \
      -v /usr/share/themes:/usr/share/themes:ro \
      -v /usr/share/fonts:/usr/share/fonts:ro \
      -v /tmp/.X11-unix:/tmp/.X11-unix -e DISPLAY=$DISPLAY loadaverage/pencil
```
