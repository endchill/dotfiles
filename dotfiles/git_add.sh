#!/usr/bin/env bash

for entry in "$@"; do
    if [[ -e $entry ]]; then
        rsync -rR "$(realpath $entry)" "$HOME/dotfiles"
    else
        printf '%s is not a file nor a directory\n' "$entry"
    fi
done

git --git-dir=$HOME/dotfiles/.git --work-tree=$HOME add $HOME/dotfiles
