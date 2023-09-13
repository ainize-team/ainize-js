#!/bin/bash

cd /app/ainize-sdk
if [[ "$1" = 'dev' ]]; then
  git checkout develop
fi
yarn install
bash ./start_local_blockchain.sh > /dev/null 2>&1
sleep 10s
cd /app/ainize-sdk
yarn install
yarn test