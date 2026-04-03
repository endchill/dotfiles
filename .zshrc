source ~/.zsh_keybinds

PROMPT="[%F{cyan}%~%f]$ "

HISTFILE=~/.zsh_history
HISTSIZE=4096
SAVEHIST=4096

setopt APPEND_HISTORY
setopt HIST_IGNORE_ALL_DUPS
setopt HIST_IGNORE_DUPS
setopt HIST_IGNORE_SPACE
setopt HIST_REDUCE_BLANKS
setopt HIST_VERIFY
setopt INC_APPEND_HISTORY
setopt SHARE_HISTORY

alias diff="diff --color=always"
alias jq="jq --indent 4 --color-output"
alias ls="ls --color=always"
alias pacman="pacman --color always"
alias pactree="pactree --color"
alias watch="watch --color"
alias yay="yay --color always"
alias dotfiles='git --git-dir=$HOME/dotfiles/.git --work-tree=$HOME'

ssh-agent -s 1>/dev/null
