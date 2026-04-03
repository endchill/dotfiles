#!/bin/bash

source "/etc/os-release"

_install() {
    root_UUID=$(findmnt -n -o UUID /)

    [[ -d "/boot/$ID" ]] || install -d "/boot/$ID"

    [[ -f /boot/amd-ucode.img ]] && ucode_lines+=$'initrd  /amd-ucode.img\n'
    [[ -f /boot/intel-ucode.img ]] && ucode_lines+=$'initrd  /intel-ucode.img\n'

    while read -r name; do
        _name="${name:6}"
        vmlinuz="vmlinuz-$name"
        initramfs="initramfs-$name.img"
        [[ ! -f "/boot/$vmlinuz" ]] || mv -f "/boot/$vmlinuz" "/boot/$ID/$vmlinuz"
        [[ ! -f "/boot/$initramfs" ]] || mv -f "/boot/$initramfs" "/boot/$ID/$initramfs"
        version=$(file /boot/$ID/$vmlinuz | sed -n 's/.*version \([^ ]*\).*/\1/p' | awk -F '-' '{print $1}')

        if [[ -z "$_name" ]]; then
            cat << EOF > /boot/loader/entries/$ID.conf
title   $ID $version kernel
linux   /$ID/$vmlinuz
initrd  /$ID/$initramfs
${ucode_lines}options root=UUID=$root_UUID rw zswap.enabled=0
EOF
        else
            cat << EOF > /boot/loader/entries/$ID-$_name.conf
title   $ID $_name $version kernel
linux   /$ID/$vmlinuz
initrd  /$ID/$initramfs
${ucode_lines}options root=UUID=$root_UUID rw zswap.enabled=0
EOF
        fi
    done < <(pacman -Qsq | grep '^linux' | grep -Ev 'firmware|headers')
}

_remove() {
    mapfile -t packages

    while read -r name; do
        _name="-${name:6}"
        vmlinuz="vmlinuz-$name"
        initramfs="initramfs-$name"
        [[ ! -f "/boot/$ID/$vmlinuz" ]] || rm /boot/$ID/$vmlinuz
        [[ ! -f "/boot/$ID/$initramfs" ]] || rm /boot/$ID/$initramfs
        [[ ! -f "/boot/loader/entries/$ID$_name.conf" ]] || rm /boot/loader/entries/$ID$_name.conf
    done < <(printf "%s\n" "${packages[@]}" | grep '^linux' | grep -Ev 'firmware|headers')
}

case $1 in
    "install")
        _install
    ;;
    "remove")
        _remove
    ;;
esac
