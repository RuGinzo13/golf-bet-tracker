#!/bin/bash
# Run this any time you want to push an update to the live site.
# Everyone will get the new version on their next page load.
set -e
cd "$(dirname "$0")"
cp golf_bet_tracker.html index.html
git add index.html
git commit -m "Update $(date '+%b %d %Y')"
git push
echo ""
echo "Done — live at https://ruginzo13.github.io/golf-bet-tracker/"
