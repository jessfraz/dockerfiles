#!/bin/bash

#Generate SSH key-pair
ssh-keygen -t rsa -N "" -f git-key -q

#Build the Docker image
docker build -t kkelkar/gitserver .
