#!/bin/bash
#
# shows git state of cables_dev and all sub repositories
#

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

plural() {
  if [ "$1" -eq 1 ] ; then echo "$1 $2"; else echo "$1 $2s"; fi
}

repo_state() {
  local dir="$1"
  local name="$2"
  cd "$dir" || return

  git fetch -q 2>/dev/null

  local branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
  local status=$(git status --porcelain 2>/dev/null)

  # ignore nested repositories showing up as untracked in the parent repo
  local untracked=0
  while IFS= read -r line ; do
    [ -z "$line" ] && continue
    local path="${line:3}"
    if [ -e "${path%/}/.git" ] ; then continue; fi
    untracked=$((untracked + 1))
  done < <(echo "$status" | grep '^??')

  local staged=$(echo "$status" | grep -c '^[MADRC]')
  local modified=$(echo "$status" | grep -c '^.[MD]')
  local conflicts=$(echo "$status" | grep -c '^\(UU\|AA\|DD\|AU\|UA\|DU\|UD\)')

  local ahead=0
  local behind=0
  local upstream=$(git rev-parse --abbrev-ref '@{upstream}' 2>/dev/null)
  if [ -n "$upstream" ] ; then
    read -r ahead behind < <(git rev-list --left-right --count HEAD...@{upstream} 2>/dev/null)
  fi

  local parts=()
  [ "$untracked" -gt 0 ] && parts+=("$(plural $untracked 'new file')")
  [ "$modified" -gt 0 ] && parts+=("$(plural $modified 'modified file')")
  [ "$staged" -gt 0 ] && parts+=("$(plural $staged 'staged file')")
  [ "$conflicts" -gt 0 ] && parts+=("${RED}$(plural $conflicts 'conflict')${YELLOW}")
  [ "$ahead" -gt 0 ] && parts+=("$(plural $ahead 'pending commit')")
  [ "$behind" -gt 0 ] && parts+=("${RED}$(plural $behind 'new commit') on server${YELLOW}")
  [ -z "$upstream" ] && parts+=("no upstream")

  local branchinfo="[$branch]"
  if [ ${#parts[@]} -eq 0 ] ; then
    printf "%-20s %-20s ${GREEN}clean${NC}\n" "$name" "$branchinfo"
  else
    local joined=$(printf " / %s" "${parts[@]}")
    printf "%-20s %-20s ${YELLOW}%b${NC}\n" "$name" "$branchinfo" "${joined:3}"
  fi
}

repo_state "$BASEDIR" "cables_dev/"

for d in "$BASEDIR"/*/ ; do
  if [ -e "$d/.git" ] ; then
    repo_state "$d" "$(basename "$d")/"
  fi
done
