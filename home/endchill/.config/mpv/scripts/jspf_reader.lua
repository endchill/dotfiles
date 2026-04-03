local mp = require 'mp'
local utils = require 'mp.utils'
local msg = require 'mp.msg'

local loading_playlist = false

mp.add_hook("on_load", 50, function()
    if loading_playlist then
        return
    end

    local path = mp.get_property("stream-open-filename", "")

    if path:match("%.jspf$") then

        msg.info("Loading JSPF playlist: \"" .. path .. "\"")

        local file = io.open(path, "r")
        if not file then
            msg.error("Failed to open file: " .. path)
            return
        end

        local content = file:read("*all")
        file:close()

        local playlist_data = utils.parse_json(content)
        if not playlist_data then
            msg.error("Failed to parse JSON")
            return
        end

        local playlist = playlist_data.playlist
        if not playlist then
            msg.error("No \"playlist\" object found in \"" .. path .. "\"")
            return
        end

        local tracks = playlist.track
        if not tracks or #tracks == 0 then
            msg.error("No tracks found in " .. "\"" .. file .. "\"")
            return
        end

        msg.info("Found " .. #tracks .. " tracks in playlist")

        loading_playlist = true

        mp.command("stop")
        mp.command("playlist-clear")

        for i, track in ipairs(tracks) do
            local location = track.location
            if location and #location > 0 then
                local url = location[1]
                msg.verbose("Adding track " .. i .. ": " .. "\"" .. url .. "\"")
                mp.commandv("loadfile", url, "append")
            end
        end

        if mp.get_property_bool("shuffle", false) then
            mp.command('playlist-shuffle')
        end

        mp.set_property_number("playlist-pos", 0)
        mp.command("play")

        loading_playlist = false
    end
end)

msg.info("JSPF playlist handler loaded")
