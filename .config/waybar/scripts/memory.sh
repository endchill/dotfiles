#!/usr/bin/env bash

values_file="$HOME/.config/waybar/scripts/values.json"
color_critical=$(jq -r '.color.negative' $values_file)
threshold_usage_memory=$(jq -r '.threshold.usage.memory' $values_file)

eval $(free -m | awk '/Mem/ {
    printf "system_usage_mib=%d\n", $3
    printf "system_usage_gib=%0.1f\n", $3/1024
    printf "system_usage_percentage=%.0f\n", $3/$2*100
}')

if [ "$system_usage_mib" -ge "2048" ]; then
    if [ "$system_usage_percentage" -ge "$threshold_usage_memory" ]; then
        printf '{"text": "<span color='\''%s'\''>%s GiB | %s%%</span>"}\n' "$color_critical" "$system_usage_gib" "$system_usage_percentage"
    else
        printf '{"text": "%s GiB | %s%%"}\n' "$system_usage_gib" "$system_usage_percentage"
    fi
else
    printf '{"text": "%s MiB | %s%%"}\n' "$system_usage_mib" "$system_usage_percentage"
fi
