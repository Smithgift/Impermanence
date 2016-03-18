#!/bin/sh
./build.sh
onchange 'contracts/*.sol' -- ./build.sh &
cd test
wzrd runner.js -p 9977 #--live
