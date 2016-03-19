#!/bin/sh
./build.sh
onchange 'contracts/*.sol' -- ./build.sh &
cd frontend
wzrd app.js #--live
