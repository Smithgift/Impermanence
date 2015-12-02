#!/bin/sh

# Hack atop hack. Abandon all elegance, all ye who run this.

cd dapp/contracts/
pwd
solc *.sol --combined-json abi > ../../build.json
cd -
echo "var Galaxy = web3.eth.contract(JSON.parse(" > frontend2/abi.js
cat build.json >> frontend2/abi.js
echo ".contracts.Galaxy.abi))" >> frontend2/abi.js