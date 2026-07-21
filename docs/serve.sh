#!/bin/sh
set -e

PORT="${1:-8080}"
DIR="$(cd "$(dirname "$0")" && pwd)"
URL="http://localhost:$PORT/index.html"

echo "Serving $DIR at $URL"

if command -v open >/dev/null 2>&1; then
  ( sleep 1 && open "$URL" ) &
elif command -v xdg-open >/dev/null 2>&1; then
  ( sleep 1 && xdg-open "$URL" ) &
fi

cd "$DIR"
exec python3 -m http.server "$PORT"
