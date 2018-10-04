#!/bin/bash

[ -e /dev/snd ] && exec apulse firefox || exec firefox
