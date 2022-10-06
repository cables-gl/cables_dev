#!/bin/bash
`mkcert > /dev/null 2>&1`
if [ "$?" != "0" ]; then
  echo "ERROR: 'mkcert' not found, please install 'mkcert' AND 'nss' via local packagemanger (see: https://github.com/FiloSottile/mkcert#installation)"
  exit 1
fi
mkdir -p ./certs/
hosts="${@:2}"
if [ "$hosts" = "" ]; then
  hosts="dev.cables.local sandbox.cables.local local.cables.local "
fi
CAROOT=./certs/ mkcert -install
if [ "$1" == "renew" ]; then
  CAROOT=./certs/ mkcert -cert-file certs/local.pem -key-file certs/localkey.pem ${hosts} localhost 127.0.0.1 ::1
  cat ./certs/local.pem >> ./certs/fullchain.pem
  cat ./certs/rootCA.pem >> ./certs/fullchain.pem
fi
