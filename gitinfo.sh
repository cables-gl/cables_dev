#!/bin/bash
currentRepo=""
testOrigin()
{
	UPSTREAM=${1:-'@{u}'}
	LOCAL=$(git rev-parse @)
	REMOTE=$(git rev-parse "$UPSTREAM")
	BASE=$(git merge-base @ "$UPSTREAM")
	
	#check if theres no upstream branch here
	#
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

testBranch()
{
	current="${1}"
	#git fetch origin
	#git remote update
	branch=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')
	#status=$(git status -s)
	#echo "status of branch is " $status

	echo "CABLES"${current}
	echo "   branch is "$branch
	#echo "  status is " $status	
}
#branch=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')
#echo $branch
#git remote -v
#git branch | grep \* | cut -d ' ' -f2

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
