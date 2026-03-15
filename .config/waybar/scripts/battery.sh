#!/usr/bin/env bash

values_file="$HOME/.config/waybar/scripts/values.json"
view_mode=$(jq -r '.view_mode.battery' $values_file)

battery_percentage=$(cat /sys/class/power_supply/BAT1/capacity)
battery_status=$(cat /sys/class/power_supply/BAT1/status)
battery_health=$(awk 'NR==1{a=$1} NR==2{b=$1; printf "%.0f\n", (a/b)*100}' /sys/class/power_supply/BAT1/charge_full /sys/class/power_supply/BAT1/charge_full_design)
remaining_time=$()
battery_voltage=$(awk '{printf "%.2f\n", $1/1000000}' /sys/class/power_supply/BAT1/voltage_now)
current_draw=$(awk '{printf "%.2f\n", $1/1000000}' /sys/class/power_supply/BAT1/current_now)
power_consumption=$(awk -v voltage=$battery_voltage -v current=$current_draw 'BEGIN {printf "%.2f\n", voltage*current}')

if [ "$battery_status" = "Not charging" ]; then
    battery_percentage="100"
    class="plugged"
else
    if [ "$battery_status" = "Charging" ]; then
        class="charging"
    elif [ "$battery_status" = "Full" ]; then
        class="shield"
    else
        if [ "$battery_percentage" -ge "95" ]; then
            class="full"
        elif [ "$battery_percentage" -ge "75" ]; then
            class="good"
        elif [ "$battery_percentage" -ge "50" ]; then
            class="normal"
        elif [ "$battery_percentage" -ge "25" ]; then
            class="low"
        elif [ "$battery_percentage" -ge "0" ]; then
            class="critical"
        else
            class="empty"
        fi
    fi
fi

printf '{"text": "%s%%", "class": "%s", "tooltip": "Battery Health: %s%%\\nBattery Voltage: %sV\\nCurrent Draw: %sA\\nPower Consumption: %sW"}\n' "$battery_percentage" "$class" "$battery_health" "$battery_voltage" "$current_draw" "$power_consumption"

echo $battery_percentage
echo $class
echo ${battery_health}
echo $battery_voltage
echo $current_draw
echo $power_consumption
