#!/usr/bin/env bash

dotfiles_dir="$HOME/dotfiles"

if [[ "$1" == "add" ]]; then
    shift

    for entry in "$@"; do
        if [[ -e $entry ]]; then
            if [[ "$(dirname $(realpath $entry))" == "$dotfiles_dir" ]]; then
                git --git-dir=$HOME/dotfiles/.git --work-tree="$dotfiles_dir" add "$dotfiles_dir/$entry"
            else
                rsync -rR "$(realpath $entry)" "$dotfiles_dir"
                git --git-dir=$HOME/dotfiles/.git --work-tree="$dotfiles_dir" add "$dotfiles_dir/$(realpath $entry)"
            fi
        else
            printf '%s is not a file nor a directory\n' "$entry"
        fi
    done
else
    git --git-dir=$HOME/dotfiles/.git --work-tree="$dotfiles_dir" $@
fi
