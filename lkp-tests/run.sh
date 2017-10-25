#!/bin/sh

lkp install ./jobs/hackbench-100.yaml

lkp run ./jobs/hackbench-100.yaml

lkp result hackbench
