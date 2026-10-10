#!/bin/sh
# Builds the site and publishes dist/ to the gh-pages branch (GitHub Pages serves that branch).
# Usage: npm run deploy
set -e
cd "$(dirname "$0")/.."
npm run build
touch dist/.nojekyll            # serve files as-is (no Jekyll processing)
REMOTE=$(git remote get-url origin)
TMP=$(mktemp -d)
cp -R dist/. "$TMP"
cd "$TMP"
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C "$OLDPWD" config user.name)" -c user.email="$(git -C "$OLDPWD" config user.email)" commit -q -m "Deploy $(date -u +%Y-%m-%dT%H:%MZ)"
git push -q -f "$REMOTE" gh-pages
rm -rf "$TMP"
echo "Deployed. Live in ~1 minute at https://nexgamesroblox.github.io/"
