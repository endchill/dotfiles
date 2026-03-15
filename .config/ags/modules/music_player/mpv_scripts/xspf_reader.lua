local mp = require 'mp'
local msg = require 'mp.msg'

local function parse_xspf(xml_str)
    local tracks = {}

    for track_block in xml_str:gmatch("<track>(.-)</track>") do
        local location = track_block:match("<location>(.-)</location>")
        if location then
            location = location:gsub("&amp;", "&")
            location = location:gsub("&lt;", "<")
            location = location:gsub("&gt;", ">")
            location = location:gsub("&quot;", '"')
            location = location:gsub("&apos;", "'")
            table.insert(tracks, location)
        end
    end

    return tracks
end

local loading_playlist = false

mp.add_hook("on_load", 50, function()
    if loading_playlist then
        return
    end

    local path = mp.get_property("stream-open-filename", "")

    if path:match("%.xspf$") then
        msg.info("Loading XSPF playlist: " .. path)

        local file = io.open(path, "r")
        if not file then
            msg.error("Failed to open file: " .. "\"" .. file .. "\"")
            return
        end

        local content = file:read("*all")
        file:close()

        local tracks = parse_xspf(content)

        if #tracks == 0 then
            msg.error("No tracks found in " .. "\"" .. file .. "\"")
            return
        end

        msg.info("Found " .. #tracks .. " tracks in playlist")

        loading_playlist = true

        mp.command("stop")
        mp.command("playlist-clear")

        for i, url in ipairs(tracks) do
            msg.verbose("Adding track " .. i .. ": " .. "\"" .. url .. "\"")
            mp.commandv("loadfile", url, "append")
        end

        if mp.get_property_bool("shuffle", false) then
            mp.command('playlist-shuffle')
        end

        mp.set_property_number("playlist-pos", 0)
        mp.command("play")

        loading_playlist = false
    end
end)

msg.info("XSPF playlist handler loaded")
