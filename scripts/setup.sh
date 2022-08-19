#!/bin/bash

# Exit if any subcommand fails
set -e

mkdir -p out

cd circuits

zokrates compile --debug -i battleship.zok

zokrates setup

zokrates export-verifier-scrypt -o ../contracts/verifier.scrypt

# mv output files to public folder
cp out abi.json verification.key proving.key ../public/zk/


cd ..

npx scryptlib ./contracts/battleship.scrypt

cp ./out/battleship_desc.json ./public


