#!/usr/bin/env bash

setup() {
    if [[ ! -f "$(dirname $0)/state.json" ]]; then
        cat <<EOF > "$(dirname $0)/state.json"
{
    "rx1": 0,
    "tx1": 0
}
EOF
    fi
}

get_main_wifi_device() {
    main_device=$($(dirname $0)/main.sh get_main_device)
    result=$(
        iwctl device list | sed '1,4d; $d' | awk '{print $2}' | while read -r dev; do
            awk -v main_device="$main_device" -v dev="$dev" 'BEGIN {if (main_device ~ dev) print dev}'
        done | head -1
    )

    if [[ -n "$result" ]]; then
        printf '%s\n' "$result"
    else
        printf 'null\n'
    fi
}

get_station_status() {
    state_file="$(dirname $0)/state.json"
    device_name=$1
    eval $(iwctl device $device_name show | awk '
        /Adapter/ {printf "adapter_name=%s\n", $2}
        /Mode/ {printf "device_mode=%s\n", $4}
        /Address/ {printf "mac_address=%s\n", $2}
    ')
    adapter_state=$(iwctl adapter $adapter_name show | awk '/Powered/ {if ($4 == "on") {printf "true\n"} else {printf "false\n"}}')

    if [[ "$device_mode" == "station" ]]; then
        eval $(iwctl station $device_name show | awk '
            /State/ {if ($2 == "connected") {printf "connection_state=true\n"} else {printf "connection_state=false\n"}}
            /Connected network/ {printf "network_name=%s\n", $3}
            /IPv4 address/ {printf "ipv4_address=%s\n", $3}
            /IPv6 address/ {printf "ipv6_address=%s\n", $3}
            /Frequency/ {frequency = $2; printf "frequency=%d\n", $2}
            /AverageRSSI/ {rssi = $2; printf "rssi=%s\n", $2}
            END {
                if (rssi >= -60) print "icon_name=network-wireless-signal-excellent-symbolic"
                else if (rssi >= -70) print "icon_name=network-wireless-signal-good-symbolic"
                else if (rssi >= -80) print "icon_name=network-wireless-signal-ok-symbolic"
                else if (rssi >= -90) print "icon_name=network-wireless-signal-weak-symbolic"
                else print "icon_name=network-wireless-signal-none-symbolic"
            }
        ')

        if [[ -z "$ipv4_address" ]]; then
            ipv4_address="Not set"
        fi

        if [[ -z "$ipv6_address" ]]; then
            ipv6_address="Not set"
        fi

        rx1=$(jq -r '.rx1' $(dirname $0)/state.json)
        tx1=$(jq -r '.tx1' $(dirname $0)/state.json)
        rx2=$(cat /sys/class/net/$device_name/statistics/rx_bytes)
        tx2=$(cat /sys/class/net/$device_name/statistics/tx_bytes)

        download_speed=$((rx2 - rx1))
        upload_speed=$((tx2 - tx1))

        jq ".rx1 = $rx2 | .tx1 = $tx2" $state_file > $(dirname $0)/tmp.json && mv $(dirname $0)/tmp.json $state_file

        printf '{"isMainWifi": true, "adapterMode": "%s", "isPowered": %s, "isConnected": %s, "networkName": "%s", "IPv4": "%s", "IPv6": "%s", "macAddress": "%s", "frequency": %.2f, "signalStrength": %d, "iconName": "%s", "downloadSpeed": %d, "uploadSpeed": %d}\n' "$device_mode" "$adapter_state" "$connection_state" "$network_name" "$ipv4_address" "$ipv6_address" "$mac_address" "$frequency" "$rssi" "$icon_name" "$download_speed" "$upload_speed"
    else
        eval $(iwctl ap $device_name show | awk '
            /Started/ {printf "ap_state=%s\n", $2}
            /Name/ {printf "ap_name=%s\n", $2}
            /Frequency/ {printf "ap_frequency=%.2f\n", $2/1000}
        ')

        printf '{"isMainWifi": true, "adapterMode": "%s", "isPowered": %s, "isConnected": %s, "networkName": "%s", "macAddress": "%s", "frequency": %.2f, "iconName": "%s", "downloadSpeed": %d, "uploadSpeed": %d}\n' "$device_mode" "$ap_state" "$connection_state" "$ap_name" "$mac_address" "$frequency" "$icon_name"
    fi
}

case "$1" in
    "setup")
        setup
    ;;
    "")
        device_name=$(get_main_wifi_device)

        if [[ $device_name == "null" ]]; then
            printf '{"isMainWifi": false}\n'
        else
            get_station_status $device_name
        fi
    ;;
esac
