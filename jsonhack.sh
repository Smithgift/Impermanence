#!/bin/sh

# Hack atop hack. Abandon all elegance, all ye who run this.

echo "var Galaxy = web3.eth.contract(JSON.parse(" > frontend2/abi.js
cat test.json >> frontend2/abi.js
echo ".contracts.Galaxy.abi))" >> frontend2/abi.js