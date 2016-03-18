#!/bin/sh
./jsonhack.sh
onchange 'dapp/**/*.sol' -- ./jsonhack.sh &
cd test
beefy runner.js 9977 #--live
