#!/bin/sh

# Shamelessly copied from:
# https://github.com/meskarune/i3lock-fancy

# All options are here: https://www.imagemagick.org/Usage/blur/#blur_args
#BLURTYPE="0x5" # 7.52s
#BLURTYPE="0x2" # 4.39s
#BLURTYPE="5x3" # 3.80s
BLURTYPE="2x8" # 2.90s
#BLURTYPE="2x3" # 2.92s

# I still have to figure out how to get imagemagick fonts to work in Alpine
#FONT="-font Liberation-Sans"
FONT=

scrot /tmp/scrot.png
convert /tmp/scrot.png \
    -level 0%,100%,0.6 -blur "$BLURTYPE" "$FONT" \
    -pointsize 26 -fill white -gravity center \
    -annotate +0+200 'Type password to unlock' \
    /tmp/conv.png
composite -gravity center /lock.png /tmp/conv.png /tmp/lock.png
#i3lock --textcolor=ffffff00 --insidecolor=ffffff1c --ringcolor=ffffff3e --linecolor=ffffff00 --keyhlcolor=00000080 --ringvercolor=00000000 --insidevercolor=0000001c --ringwrongcolor=00000055 --insidewrongcolor=0000001c  -i $IMAGE
i3lock -i /tmp/lock.png --ignore-empty-password

