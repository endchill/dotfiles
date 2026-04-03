local mp = require 'mp'
local utils = require 'mp.utils'
local msg = require 'mp.msg'

local playlist_extensions = {
    ".m3u", ".m3u8", ".pls", ".cue", ".asx", ".xspf", ".jspf"
}

local function is_playlist_file(filename)
    if not filename then return false end
    local lower = filename:lower()
    for _, ext in ipairs(playlist_extensions) do
        if lower:match(ext .. "$") then
            return true
        end
    end
    return false
end

local function get_directory_playlists(current_path)
    local dir = utils.split_path(current_path)
    local files = utils.readdir(dir, "files")

    if not files then return nil end

    local playlists = {}
    for _, file in ipairs(files) do
        if is_playlist_file(file) then
            table.insert(playlists, utils.join_path(dir, file))
        end
    end

    table.sort(playlists)
    return playlists
end

local function get_next_playlist(current_path)
    local playlists = get_directory_playlists(current_path)
    if not playlists or #playlists == 0 then return nil end

    for i, playlist in ipairs(playlists) do
        if playlist == current_path then
            if i < #playlists then
                return playlists[i + 1]
            end
            return nil
        end
    end

    return nil
end

local function on_end_file(event)
    if event.reason == "eof" then
        local playlist_path = mp.get_property("playlist-path")

        if not playlist_path or not is_playlist_file(playlist_path) then
            return
        end

        local pos = mp.get_property_number("playlist-pos", -1)
        local count = mp.get_property_number("playlist-count", 0)

        if pos == count - 1 then
            local next_playlist = get_next_playlist(playlist_path)
            if next_playlist then
                msg.info("Loading next playlist: " .. next_playlist)
                mp.commandv("loadfile", next_playlist, "replace")
            else
                msg.info("No next playlist found")
            end
        end
    end
end

mp.register_event("end-file", on_end_file)
