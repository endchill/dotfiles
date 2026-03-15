#!/usr/bin/env bash

values_file="$HOME/.config/waybar/scripts/values.json"
color_positive=$(jq -r '.color.positive' $values_file)
color_negative=$(jq -r '.color.negative' $values_file)

info=$(ssh scripter@sv "/opt/scripter/ssh-handler.sh")
status=$(printf '%s\n' "$info" | jq -r '.status')
uptime=$(printf '%s\n' "$info" | jq -r '.uptime')

if [ "$status" = "true" ]; then
    text="<span color='$color_positive'>up</span>"
else
    text="<span color='$color_negative'>down</span>"
fi

printf '{"text": "%s", "tooltip": "%s"}\n' "$text" "$uptime"
