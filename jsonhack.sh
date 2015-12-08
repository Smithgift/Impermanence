#!/bin/sh

# Hack atop hack. Abandon all elegance, all ye who run this.

cd dapp/contracts/
pwd
solc --combined-json abi,bin ../_pre/shiplib.sol *.sol > ../../build.json
cd -
echo "module.exports = " > frontend2/abi.js
cat build.json >> frontend2/abi.js
#echo "var Galaxy = web3.eth.contract(JSON.parse(build" >> frontend2/abi.js
#echo ".contracts.Galaxy.abi))" >> frontend2/abi.js
