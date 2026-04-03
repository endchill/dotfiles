#!/usr/bin/env bash

values_file="$HOME/.config/waybar/scripts/values.json"
date_mode=$(jq -r '.view_mode.date' $values_file)

switch_view_mode() {
    if [ "$(jq -r '.view_mode.date' $values_file)" = "false" ]; then
        jq '.view_mode.date = true' $values_file > temp.json && mv temp.json $values_file
    else
        jq '.view_mode.date = false' $values_file > temp.json && mv temp.json $values_file
    fi
}

switch_date_type() {
    if [ "$(jq -r '.view_mode.date' $values_file)" = "true" ]; then
        if [ "$(jq -r '.view_mode.show_hijri' $values_file)" = "false" ]; then
            jq '.view_mode.show_hijri = true' $values_file > temp.json && mv temp.json $values_file
        else
            jq '.view_mode.show_hijri = false' $values_file > temp.json && mv temp.json $values_file
        fi
    fi
}

refresh_info() {
    greg_date=$(date +"%Y.%m.%d")
    hijri_date=$(curl -s https://api.aladhan.com/v1/gToH/$(date +"%d-%m-%Y") | jq -r '"\(.data.hijri.year).\(.data.hijri.month.number).\(.data.hijri.day)"')
    month_day=$(date +"%m%d" | sed 's/^0*//')

    jq --arg greg_date "$greg_date" '.date.greg = $greg_date' $values_file > temp.json && mv temp.json $values_file
    jq --arg hijri_date "$hijri_date" '.date.hijri = $hijri_date' $values_file > temp.json && mv temp.json $values_file

    if [[ $month_day -ge 1221 ]] || [[ $month_day -le 319 ]]; then
        jq '.misc.current_season = "winter"' $values_file > temp.json && mv temp.json $values_file
    elif [[ $month_day -ge 320 ]] && [[ $month_day -le 620 ]]; then
        jq '.misc.current_season = "spring"' $values_file > temp.json && mv temp.json $values_file
    elif [[ $month_day -ge 621 ]] && [[ $month_day -le 922 ]]; then
        jq '.misc.current_season = "summer"' $values_file > temp.json && mv temp.json $values_file
    else
        jq '.misc.current_season = "autumn"' $values_file > temp.json && mv temp.json $values_file
    fi
}

get_info() {
    if [ "$date_mode" = true ]; then
        show_hijri=$(jq -r '.view_mode.show_hijri' $values_file)
        color_season_winter=$(jq -r '.color.season.winter' $values_file)
        color_season_spring=$(jq -r '.color.season.spring' $values_file)
        color_season_summer=$(jq -r '.color.season.summer' $values_file)
        color_season_autumn=$(jq -r '.color.season.autumn' $values_file)
        date_greg=$(jq -r '.date.greg' $values_file)
        date_hijri=$(jq -r '.date.hijri' $values_file)
        current_season=$(jq -r '.misc.current_season' $values_file)
        if [ "$show_hijri" = "true" ]; then
            date=$date_hijri
        else
            date=$date_greg
        fi
        case "$current_season" in
            "winter")
                echo "{\"text\": \"<span color='$color_season_winter'>$date</span>\"}"
                exit 0
            ;;
            "spring")
                echo "{\"text\": \"<span color='$color_season_spring'>$date</span>\"}"
                exit 0
            ;;
            "summer")
                echo "{\"text\": \"<span color='$color_season_summer'>$date</span>\"}"
                exit 0
            ;;
            "autumn")
                echo "{\"text\": \"<span color='$color_season_autumn'>$date</span>\"}"
                exit 0
            ;;
        esac
    else
        time=$(date +"%I:%M %p")
        if [ "$(date +"%p")" = "AM" ]; then
            color_clock_am=$(jq -r '.color.clock.am' $values_file)
            echo "{\"text\": \"<span color='$color_clock_am'>$time</span>\"}"
        else
            color_clock_pm=$(jq -r '.color.clock.pm' $values_file)
            echo "{\"text\": \"<span color='$color_clock_pm'>$time</span>\"}"
        fi
    fi
}

case "$1" in
    "get_info")
        get_info
    ;;
    "refresh_info")
        refresh_info
    ;;
    "switch_view_mode")
        switch_view_mode
    ;;
    "switch_date_type")
        switch_date_type
    ;;
esac
