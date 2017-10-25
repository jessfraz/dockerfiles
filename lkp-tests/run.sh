#!/bin/sh

echo "Installing dependencies for hackbench..."
yes | lkp install ./jobs/hackbench-100.yaml

echo "Running hackbench..."
yes | lkp run ./jobs/hackbench-100.yaml

echo "Getting result from hackbench..."
lkp stat hackbench
