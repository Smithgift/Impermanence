#!/bin/sh
./build.sh
onchange 'contracts/*.sol' -- ./build.sh &
cd frontend
beefy app.js #--live
