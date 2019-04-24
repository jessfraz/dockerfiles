#!/bin/bash

if [ -z "$DATA_DIR" ]; then
	DATA_DIR="/data"
fi

google-chrome --user-data-dir=$DATA_DIR $URL
