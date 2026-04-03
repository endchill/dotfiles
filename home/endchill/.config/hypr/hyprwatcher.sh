#!/usr/bin/env bash

socket_file="$XDG_RUNTIME_DIR/hypr/$HYPRLAND_INSTANCE_SIGNATURE/.socket2.sock"
config=$(cat "${BASH_SOURCE[0]%/*}/hyprwatcher_data/config.json")

monitors() {
    _monitors=$(hyprctl -j monitors)

    while read -r storingDir profile path run; do
        name=$(basename $path)
        name_no_ext=${name%.*}

        cp ${storingDir}/${name_no_ext}_$profile.* $(realpath $path)
        [[ -z "$run" ]] || eval "$run & disown"
    done < <(jq -rn --argjson _monitors "$_monitors" --argjson config "$config" '
        $config[] | select(
            (.monitors | sort) == ([$_monitors[].name] | sort)
        ) | .storingDir as $storingDir | .profile as $profile | .replace[] as $path | .run[] as $run | [$storingDir, $profile, $path, $run] | @tsv
    ')
}

handler() {
    case $1 in
        monitoraddedv2*|monitorremovedv2*)
            monitors
        ;;
    esac
}

while read -r storingDir; do
    [[ ! -d "$storingDir" ]] || install -d $storingDir
done < <(jq -r '.[].storingDir' <<< $config)

monitors

socat -U - UNIX-CONNECT:$socket_file | while read -r line; do
    handler $line
done
