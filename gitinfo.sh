#!/bin/bash
#get current branch,accepts string parameter to update current repo 
testBranch()
{
	current="${1}"
	branch=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')

	echo "CABLES"${current}
	echo "   current branch is "$branch
}
#tests if origin has changed and informs user if they need to pull
#cannot work correctly with local branches yet
testOrigin()
{
	UPSTREAM=${1:-'@{u}'}
	LOCAL=$(git rev-parse @)
	REMOTE=$(git rev-parse "$UPSTREAM")
	BASE=$(git merge-base @ "$UPSTREAM")
	
	#check if theres no upstream branch here
	if [[ $LOCAL = $REMOTE ]]; then
	    echo "   Up-to-date"
	elif [[ $LOCAL = $BASE ]]; then
	    echo "   Need to pull"
	elif [[ $REMOTE = $BASE ]]; then
	    echo "   Need to push"
	else
	    echo "   Diverged"
	fi
}

cd cables
	testBranch ""
	testOrigin
cd ..
cd cables_ui
	testBranch "_UI"
	testOrigin
cd ..
cd cables_api
	testBranch "_API"
	testOrigin
cd ..
