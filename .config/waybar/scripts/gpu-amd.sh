#!/usr/bin/env bash

values_file="$HOME/.config/waybar/scripts/values.json"
color_regular=$(jq -r '.color.text' $values_file)
color_critical=$(jq -r '.color.negative' $values_file)
gpu_usage_threshold=$(jq -r '.threshold.usage.gpu' $values_file)
gpu_temperature_threshold=$(jq -r '.threshold.temperature.gpu' $values_file)

usage=$(cat /sys/class/drm/renderD128/device/gpu_busy_percent)
temperature=$(awk '{printf $1/1000}' /sys/class/drm/renderD128/device/hwmon/hwmon*/temp1_input)

get_color() {
    local value=$1
    local threshold=$2
    if [ "$value" -ge "$threshold" ]; then
        echo "$color_critical"
    else
        echo "$color_regular"
    fi
}

usage_color=$(get_color "$usage" "$gpu_usage_threshold")
temperature_color=$(get_color "$temperature" "$gpu_temperature_threshold")

printf '{"text": "<span color='\''%s'\''>%s%%</span> | <span color='\''%s'\''>%s°C</span>"}\n' "$usage_color" "$usage" "$temperature_color" "$temperature"
