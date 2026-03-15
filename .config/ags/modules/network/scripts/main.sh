#!/usr/bin/env bash

get_main_device() {
    ip route show default | awk '{print $11, $5}' | sort -n | head -1 | awk '{print $2}'
}

get_main_adapter() {
    local device_name=$1
    cat /sys/class/net/$device_name/phy80211/name
}

case "$1" in
    "get_main_device")
        get_main_device
    ;;
    "get_main_adapter")
        get_main_adapter $(get_main_device)
    ;;
esac
