# Valentina DB Studio

#### Valentina Studio is your universal database management tool for working with MySQL, MariaDB, SQL Server, PostgreSQL, SQLite and Valentina DB databases


run docker container
```
export DOCKER_DISPLAY=$(ifconfig en0 | grep inet | awk '$1=="inet" {print $2}'):0 \
docker run --rm \
    -e DISPLAY=$DOCKER_DISPLAY \
    -v /tmp/.X11-unix:/tmp/.X11-unix \
    -v $HOME/.config:/home/valentina/.config \
    burnerdev/valentina-db
```
