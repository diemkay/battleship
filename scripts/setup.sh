#!/bin/bash

# Exit if any subcommand fails
set -e

mkdir -p out

cd circuits

zokrates compile -i battleship.zok

zokrates setup

zokrates export-verifier-scrypt -o ../contracts/verifier.scrypt

cd ..

npx scryptlib ./contracts/battleship.scrypt


