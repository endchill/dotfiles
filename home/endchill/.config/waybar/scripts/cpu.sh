#!/usr/bin/env bash

values_file="$HOME/.config/waybar/scripts/values.json"
color_regular=$(jq -r '.color.text' $values_file)
color_critical=$(jq -r '.color.negative' $values_file)
cpu_usage_threshold=$(jq -r '.threshold.usage.cpu' $values_file)
cpu_temperature_threshold=$(jq -r '.threshold.temperature.cpu' $values_file)

usage=$(top -bn2 -d1 | grep "Cpu(s)" | tail -1 | awk '{printf "%.0f", 100-$8}' | cut -d'%' -f1)
temperature=$(awk '{print int($1/1000)}' /sys/class/hwmon/hwmon3/temp1_input)

get_color() {
    local value=$1
    local threshold=$2
    if [ "$value" -ge "$threshold" ]; then
        echo "$color_critical"
    else
        echo "$color_regular"
    fi
}

usage_color=$(get_color "$usage" "$cpu_usage_threshold")
temperature_color=$(get_color "$temperature" "$cpu_temperature_threshold")

printf '{"text": "<span color='\''%s'\''>%s%%</span> | <span color='\''%s'\''>%s°C</span>"}\n' "$usage_color" "$usage" "$temperature_color" "$temperature"
