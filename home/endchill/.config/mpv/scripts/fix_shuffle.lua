local original_order = {}
local shuffled_to_original = {}

function build_original_order()
    original_order = {}
    local playlist_count = mp.get_property_number("playlist-count", 0)

    for i = 0, playlist_count - 1 do
        local filename = mp.get_property(string.format("playlist/%d/filename", i))
        table.insert(original_order, filename)
    end
end

function build_shuffle_mapping()
    shuffled_to_original = {}
    local playlist_count = mp.get_property_number("playlist-count", 0)

    for i = 0, playlist_count - 1 do
        local filename = mp.get_property(string.format("playlist/%d/filename", i))
        for j, orig_filename in ipairs(original_order) do
            if filename == orig_filename then
                shuffled_to_original[i] = j - 1
                break
            end
        end
    end
end

function on_shuffle_change(name, value)
    local playlist_count = mp.get_property_number("playlist-count", 0)

    if playlist_count <= 1 then
        return
    end

    if value == true then
        build_original_order()
        mp.command("playlist-shuffle")
        build_shuffle_mapping()
        mp.osd_message("Playlist shuffled from current track")
    else
        local current_shuffled_pos = mp.get_property_number("playlist-pos", 0)
        local original_pos = shuffled_to_original[current_shuffled_pos]

        if original_pos then
            mp.command("playlist-unshuffle")
            mp.set_property_number("playlist-pos", original_pos)
            mp.osd_message("Playlist unshuffled")
        else
            mp.command("playlist-unshuffle")
            mp.osd_message("Playlist unshuffled")
        end
    end
end

mp.observe_property("shuffle", "bool", on_shuffle_change)
