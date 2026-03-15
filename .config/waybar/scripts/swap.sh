#!/usr/bin/env bash

values_file="$HOME/.config/waybar/scripts/values.json"
view_mode=$(jq -r '.view_mode.swap' $values_file)
color_critical=$(jq -r '.color.negative' $values_file)
swap_usage_threshold=$(jq -r '.threshold.usage.swap' $values_file)

number_of_swaps=$(tail -n +2 /proc/swaps | wc -l)

for ((i=1; i<=$number_of_swaps; i++)); do
    swap_info=$(sed '1d' /proc/swaps | sed -n "s|.*/||; ${i}p")
    swap_name=$(printf '%s\n' "$swap_info" | awk '{printf $1\n}')

    if [[ "$swap_name" == zram* ]]; then
        zram_info=$(cat /sys/block/$swap_name/mm_stat)
        zram_total=$(cat /sys/block/$swap_name/disksize)
        eval $(printf '%s\n' "$zram_info" | awk -v zram_total="$zram_total" -v swap_name="$swap_name" -v swap_number="$i" '{
            printf "%s_compression_factor=%.2f\n", swap_name, ($2-63)/($1-4095)
            printf "swap_%d=%s\n", swap_number, swap_name
            printf "%s_total_kib=%d\n", swap_name, zram_total/1024
            printf "%s_usage_kib=%d\n", swap_name, ($1-4096)/1024
            printf "%s_usage_mib=%.0f\n", swap_name, ($1-4096)/1048576
            printf "%s_usage_gib=%.1f\n", swap_name, ($1-4096)/1073741824
            printf "%s_usage_percentage=%.0f\n", swap_name, $1/zram_total*100
            printf "%s_size_saved_kib=%d\n", swap_name, (($1-4096)-($3-20480))/1024
            printf "%s_size_saved_mib=%.0f\n", swap_name, (($1-4096)-($3-20480))/1048576
            printf "%s_size_saved_gib=%.1f\n", swap_name, (($1-4096)-($3-20480))/1073741824
        }')
    else
        eval $(printf '%s\n' "$swap_info" | awk -v swap_number="$i" -v swap_name="$swap_name" '{
            printf "swap_%d=%s\n", swap_number, swap_name
            printf "%s_total_kib=%d\n", swap_name, $3
            printf "%s_usage_kib=%d\n", swap_name, $4
            printf "%s_usage_mib=%.0f\n", swap_name, $4/1024
            printf "%s_usage_gib=%.1f\n", swap_name, $4/1048576
            printf "%s_usage_percentage=%.0f\n", swap_name, $4/$3*100
        }')
    fi

    zram_compression_factor_tmp="${swap_name}_compression_factor"
    zram_size_saved_kib_tmp="${swap_name}_size_saved_kib"
    zram_size_saved_mib_tmp="${swap_name}_size_saved_mib"
    zram_size_saved_gib_tmp="${swap_name}_size_saved_gib"
    swap_usage_kib_tmp="${swap_name}_usage_kib"
    swap_usage_mib_tmp="${swap_name}_usage_mib"
    swap_usage_gib_tmp="${swap_name}_usage_gib"
    swap_usage_percentage_tmp="${swap_name}_usage_percentage"

    zram_compression_factor="${!zram_compression_factor_tmp}"
    zram_size_saved_kib="${!zram_size_saved_kib_tmp}"
    zram_size_saved_mib="${!zram_size_saved_mib_tmp}"
    zram_size_saved_gib="${!zram_size_saved_gib_tmp}"
    swap_usage_kib="${!swap_usage_kib_tmp}"
    swap_usage_mib="${!swap_usage_mib_tmp}"
    swap_usage_gib="${!swap_usage_gib_tmp}"
    swap_usage_percentage="${!swap_usage_percentage_tmp}"

    if [[ "$swap_name" == zram* ]]; then
        if [[ "$swap_usage_mib" -ge "2048" ]]; then
            if [[ "$swap_usage_percentage" -ge "$swap_usage_threshold" ]]; then
                swap_usage="<span color='$color_critical'>$swap_name: $swap_usage_gib GiB | $swap_usage_percentage%\n              $zram_size_saved_gib GiB | $zram_compression_factor</span>"
            else
                swap_usage="$swap_name: $swap_usage_gib GiB | $swap_usage_percentage%\n              $zram_size_saved_gib GiB | $zram_compression_factor"
            fi
        elif [[ "$swap_usage_kib" -ge "2048" ]]; then
            swap_usage="$swap_name: $swap_usage_mib MiB | $swap_usage_percentage%\n              $zram_size_saved_mib MiB | $zram_compression_factor"
        else
            swap_usage="$swap_name: $swap_usage_kib KiB | $swap_usage_percentage%\n              $zram_size_saved_kib KiB | $zram_compression_factor"
        fi
    else
        if [[ "$swap_usage_mib" -ge "2048" ]]; then
            if [[ "$swap_usage_percentage" -ge "$swap_usage_threshold" ]]; then
                swap_usage="<span color='$color_critical'>$swap_name: $swap_usage_gib GiB | $swap_usage_percentage%</span>"
            else
                swap_usage="$swap_name: $swap_usage_gib GiB | $swap_usage_percentage%"
            fi
        elif [[ "$swap_usage_kib" -ge "2048" ]]; then
            swap_usage="$swap_name: $swap_usage_mib MiB | $swap_usage_percentage%"
        else
            swap_usage="$swap_name: $swap_usage_kib KiB | $swap_usage_percentage%"
        fi
    fi

    if [[ "$tooltip" ]]; then
        tooltip="$tooltip\n$swap_usage"
    else
        tooltip="$swap_usage"
    fi

    total_kib="${swap_name}_total_kib"
    usage_kib="${swap_name}_usage_kib"

    total_size_kib=$(($total_size_kib+${!total_kib}))
    total_usage_kib=$(($total_usage_kib+${!usage_kib}))
done

eval $(awk -v total_usage_kib="$total_usage_kib" -v total_size_kib="$total_size_kib" 'BEGIN {
    printf "total_usage_mib=%.0f\n", total_usage_kib/1024
    printf "total_usage_gib=%.1f\n", total_usage_kib/1048576
    printf "total_usage_percentage=%.0f\n", total_usage_kib/total_size_kib*100
}')

if [[ "$total_usage_mib" -ge "2048" ]]; then
    if [[ "$total_usage_percentage" -ge "$swap_usage_threshold" ]]; then
        total_usage="<span color='$color_critical'>$total_usage_gib GiB | $total_usage_percentage%</span>"
    else
        total_usage="$total_usage_gib GiB | $total_usage_percentage%"
    fi
elif [[ "$total_usage_kib" -ge "2048" ]]; then
    total_usage="$total_usage_mib MiB | $total_usage_percentage%"
else
    total_usage="$total_usage_kib KiB | $total_usage_percentage%"
fi

printf '{"text": "%s", "tooltip": "%s"}\n' "$total_usage" "$tooltip"
