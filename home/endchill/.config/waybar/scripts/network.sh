#!/usr/bin/env bash

values_file="$HOME/.config/waybar/scripts/values.json"
color_download=$(jq -r '.color.download' $values_file)
color_upload=$(jq -r '.color.upload' $values_file)

interface=wlan0

format_bandwidth() {
    local bytes=$1
    if [ $bytes -ge 1048576 ]; then
        awk -v bytes="$bytes" 'BEGIN {printf "%.1f MiB/s\n", bytes/1048576}'
    elif [ $bytes -ge 1024 ]; then
        awk -v bytes="$bytes" 'BEGIN {printf "%.1f KiB/s\n", bytes/1024}'
    else
        printf '%d B/s' "$bytes"
    fi
}

rx1=$(jq -r '.network.rx1' $values_file)
tx1=$(jq -r '.network.tx1' $values_file)
rx2=$(cat /sys/class/net/$interface/statistics/rx_bytes)
tx2=$(cat /sys/class/net/$interface/statistics/tx_bytes)

rx_rate=$((rx2 - rx1))
tx_rate=$((tx2 - tx1))

jq ".network.rx1 = $rx2 | .network.tx1 = $tx2" $values_file > $(dirname $0)/tmp.json && mv $(dirname $0)/tmp.json $values_file

printf '{"text": "<span color='\''%s'\''>%s</span> | <span color='\''%s'\''>%s</span>"}\n' "$color_download" "$(format_bandwidth $rx_rate)" "$color_upload" "$(format_bandwidth $tx_rate)"
