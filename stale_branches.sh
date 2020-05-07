#!/bin/bash
export LC_ALL=C
echo "STALE BRANCHES IN CORE":
cd cables
git fetch
for branch in `git branch -r --merged | grep -v HEAD`; do echo -e `git show --format="%ci %cr %an" $branch | head -n 1` \\t$branch; done | sort -r | grep " months"
cd ..
echo "STALE BRANCHES IN API":
cd cables_api
git fetch
for branch in `git branch -r --merged | grep -v HEAD`; do echo -e `git show --format="%ci %cr %an" $branch | head -n 1` \\t$branch; done | sort -r | grep " months"
cd ..
echo "STALE BRANCHES IN UI":
cd cables_ui
git fetch
for branch in `git branch -r --merged | grep -v HEAD`; do echo -e `git show --format="%ci %cr %an" $branch | head -n 1` \\t$branch; done | sort -r | grep " months"
cd ..
unset LC_ALL
