#!/usr/bin/env bash
set -e

echo "▶ Starting dfx local replica (127.0.0.1:4943)..."
dfx stop
dfx start --background --clean --host 127.0.0.1:4943

# Get the Plug principal from environment (edit this if you hardcode your Plug principal)
OWNER_PRINCIPAL="z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe"

echo "▶ Patching owner principal in backend canisters (if placeholder present)..."
for f in backend/*/main.mo backend/*.mo; do
  if [ -f "$f" ]; then
    if grep -q 'Principal.fromText("aaaaa-aa' "$f"; then
      sed -i.bak -E "s|Principal.fromText\\(\"[^\"]*\"\\)|Principal.fromText(\"$OWNER_PRINCIPAL\")|g" "$f"
      echo "  patched owner in $f"
    else
      if grep -q "Principal.fromText(\"$OWNER_PRINCIPAL\")" "$f"; then
        echo "  already contains owner in $f"
      fi
    fi
  fi
done

echo "▶ Deploying canisters..."
dfx deploy --network local
