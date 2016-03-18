#!/bin/sh
./build.sh
onchange 'contracts/*.sol' -- ./build.sh &
cd test
beefy runner.js 9977 #--live
