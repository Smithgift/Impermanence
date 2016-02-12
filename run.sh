#!/bin/sh
./jsonhack.sh
onchange 'dapp/**/*.sol' -- ./jsonhack.sh &
cd frontend
beefy app.js --live
