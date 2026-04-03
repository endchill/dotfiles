#!/usr/bin/env bash

network_device="wlan0"

eval $(iwctl station $network_device show | awk '
    /State/ {printf "station_state=%s\n", $2}
    /Connected network/ {printf "network_name=%s\n", $3}
    /IPv4 address/ {printf "ipv4_address=%s\n", $3}
    /IPv6 address/ {printf "ipv6_address=%s\n", $3}
    /ConnectedBss/ {printf "mac_address=%s\n", $2}
    /Frequency/ {printf "frequency=%.2f\n", $2/1000}
    /AverageRSSI/ {printf "rssi=%s\n", $2}
')

eval $(iwctl ap $network_device show | awk '
    /Started/ {printf "ap_state=%s\n", $2}
    /Name/ {printf "ap_name=%s\n", $2}
    /Frequency/ {printf "ap_frequency=%.2f\n", $2/1000}
')

if [[ -z "$ipv4_address" ]]; then
    ipv4_address="Not set"
fi

if [[ -z "$ipv6_address" ]]; then
    ipv6_address="Not set"
fi

if [[ "$station_state" == "connected" ]]; then
    if [[ "$rssi" -ge "-60" ]]; then
        class="connected-strong"
    elif [[ "$rssi" -ge "-70" ]]; then
        class="connected-good"
    elif [[ "$rssi" -ge "-80" ]]; then
        class="connected-fair"
    elif [[ "$rssi" -ge "-90" ]]; then
        class="connected-weak"
    else
        class="connected-no_signal"
    fi
elif [[ "$station_state" == "disconnected" ]]; then
    class="disconnected"
fi

printf '{"text":"    ", "class": "%s", "tooltip": "Network Name: %s\\nIPv4: %s\\nIPv6: %s\\nMac Address: %s\\nFrequency: %s GHz\\nSignal Strength: %s dBm"}' "$class" "$network_name" "$ipv4_address" "$ipv6_address" "$mac_address" "$frequency" "$rssi"
