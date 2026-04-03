#!/usr/bin/env bash

values_file="$HOME/.config/waybar/scripts/values.json"
tailscale_status=$(tailscale status --json | jq -r '.BackendState')
machine_name=$(tailscale status --json | jq -r '.Self.HostName')
machine_ipv4=$(tailscale status --json | jq -r '.Self.TailscaleIPs[0]')
machine_ipv6=$(tailscale status --json | jq -r '.Self.TailscaleIPs[1]')
machine_magicdns=$(tailscale status --json | jq -r '.Self.DNSName' | sed 's/.$//')
tailscale_account=$(tailscale status --json | jq -r '.CurrentTailnet.Name')
tailscale_tailnet=$(tailscale status --json | jq -r '.CurrentTailnet.MagicDNSSuffix')
color_negative=$(jq -r '.color.negative' $values_file)
copy_last=$(jq -r '.misc.tailscale_copy_last' $values_file)

get_info() {
    case "$tailscale_status" in
        "Running")
            text="Connected"
            class="connected"
            tooltip="Tailscale: $tailscale_status\nAccount: $tailscale_account\nNode: $machine_name\nTailnet: $tailscale_tailnet\nIPv4: $machine_ipv4\nIPv6: $machine_ipv6"
        ;;
        "Stopped")
            text="<span color='$color_negative'>Disconnected</span>"
            class="disconnected"
            tooltip="Tailscale: $tailscale_status"
        ;;
        "NeedsLogin")
            text="Needs Login"
            class="needslogin"
            tooltip="Tailscale: $tailscale_status"
        ;;
        *)
            text="$tailscale_status"
            class="unknown"
            tooltip="Tailscale: $tailscale_status"
        ;;
    esac

    echo "{\"text\": \"$text\", \"class\": \"$class\", \"tooltip\": \"$tooltip\"}"
}

tailscale_toggle() {
    if [ "$tailscale_status" = "Running" ]; then
        tailscale down
    elif [ "$tailscale_status" = "Stopped" ]; then
        tailscale up
    fi
}

account_menu() {
    accounts=$(tailscale switch --list | awk '{print $2}' | sed "1d")
    local menu=$(echo -e "$accounts\nAdd New Account\n<span color='$color_negative'>Logout</span>" | wofi --width 240 --height 240 --xoffset 1594 --yoffset 0 -djm --sort-order=default)

    case "$menu" in
        "Add New Account")
            script -q -c "tailscale login" /dev/null | while read -r url; do
                if [[ "$url" =~ https://login\.tailscale\.com ]]; then
                   xdg-open "$url"
                fi
            done
            exit 0
        ;;
        "Logout Current")
            tailscale logout
            exit 0
        ;;
        *)
            tailscale switch $menu
            exit 0
        ;;
    esac
}

copy_menu() {
    local menu=$(echo -e "Copy IPv4\nCopy IPv6\nCopy MagicDNS" | wofi --width 240 --height 240 --xoffset 1582 --yoffset 0 -djm --sort-order=default)

    case "$menu" in
        "Copy IPv4")
            echo "$machine_ipv4" | wl-copy
            notify-send "Waybar Tailscale Module" "IPv4 copied to clipboard"
            jq '.misc.tailscale_copy_last = "ipv4"' $values_file > temp.json && mv temp.json $values_file
            exit 0
        ;;
        "Copy IPv6")
            echo "$machine_ipv6" | wl-copy
            notify-send "Waybar Tailscale Module" "IPv6 copied to clipboard"
            jq '.misc.tailscale_copy_last = "ipv6"' $values_file > temp.json && mv temp.json $values_file
            exit 0
        ;;
        "Copy MagicDNS")
            echo "$machine_magicdns" | wl-copy
            notify-send "Waybar Tailscale Module" "MagicDNS copied to clipboard"
            jq '.misc.tailscale_copy_last = "magicdns"' $values_file > temp.json && mv temp.json $values_file
            exit 0
        ;;
    esac
}

copy_last() {
    case "$copy_last" in
    "ipv4")
        echo "$machine_ipv4" | wl-copy
        notify-send "Waybar Tailscale Module" "IPv4 copied to clipboard"
        exit 0
    ;;
    "ipv6")
        echo "$machine_ipv6" | wl-copy
        notify-send "Waybar Tailscale Module" "IPv6 copied to clipboard"
        exit 0
    ;;
    "magicdns")
        echo "$machine_magicdns" | wl-copy
        notify-send "Waybar Tailscale Module" "MagicDNS copied to clipboard"
        exit 0
    ;;
    esac
}

case "$1" in
    "get_info")
        get_info
    ;;
    "toggle")
        tailscale_toggle
        exit 0
    ;;
    "account_menu")
        account_menu
        exit 0
    ;;
    "copy_menu")
        copy_menu
        exit 0
    ;;
    "copy_last")
        copy_last
    ;;
esac
