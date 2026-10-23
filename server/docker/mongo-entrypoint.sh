#!/usr/bin/env bash
set -euo pipefail

# A persistent key enables authentication on the local single-node replica set.
keyfile=/data/configdb/replica.key
if [ ! -s "$keyfile" ]; then
  openssl rand -base64 756 > "$keyfile"
fi
chmod 400 "$keyfile"
chown mongodb:mongodb "$keyfile"

exec /usr/local/bin/docker-entrypoint.sh mongod --replSet rs0 --keyFile "$keyfile" --bind_ip_all
