#!/bin/bash
#
# Open new Terminal tabs from the command line
#
# Author: Justin Hileman (http://justinhileman.com)
#

# Only for the Mac users
[ `uname -s` != "Darwin" ] && return

cdto="$PWD"
args="$@"

if [ -d "$1" ]; then
    cdto=`cd "$1"; pwd`
    args="${@:2}"
fi

osascript &>/dev/null <<EOF
    tell application "System Events"
        tell process "Terminal" to keystroke "t" using command down
    end tell
    tell application "Terminal"
        activate
        do script with command "cd \"$cdto\"; $args" in selected tab of the front window
    end tell
EOF