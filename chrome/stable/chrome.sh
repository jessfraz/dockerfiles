docker run -it --rm \
	-v /tmp/.X11-unix:/tmp/.X11-unix \
	-e DISPLAY=unix$DISPLAY \
	-v $HOME/Downloads:/home/chrome/Downloads \
	-v $HOME/.config/google-chrome/:/data \
	chrome \
	bash
