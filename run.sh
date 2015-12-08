#!/bin/sh
./jsonhack.sh
onchange 'dapp/**/*.sol' -- ./jsonhack.sh &
cd frontend2
beefy app.js --live
