import app from "ags/gtk4/app"
import GLib from "gi://GLib?version=2.0"
import Gio from "gi://Gio?version=2.0"
import { readFile, writeFile } from "ags/file"
import { execAsync } from "ags/process"
import { mpvStatus, metadata, playlistMetadata, labels } from "./main.tsx"

const cacheFile = `${GLib.get_user_cache_dir()}/ags/music_player/cache.json`
const cache = JSON.parse(readFile(`${cacheFile}`))

const socketPath = `/tmp/ags_${GLib.get_user_name()}/mpv.socket`
const client = new Gio.SocketClient()
const address = Gio.UnixSocketAddress.new(socketPath)
let connection: Gio.SocketConnection | null = null
let outputStream: Gio.OutputStream | null = null
let inputStream: Gio.InputStream | null = null
let dataStream: Gio.DataInputStream | null = null

const commands = [
    '{"command": ["observe_property", 1, "filename/no-ext"]}\n',
    '{"command": ["observe_property", 2, "path"]}\n',
    '{"command": ["observe_property", 3, "duration"]}\n',
    '{"command": ["observe_property", 4, "time-pos"]}\n',
    '{"command": ["observe_property", 5, "pause"]}\n',
    '{"command": ["observe_property", 6, "shuffle"]}\n',
    '{"command": ["observe_property", 7, "loop-file"]}\n',
    '{"command": ["observe_property", 8, "loop-playlist"]}\n',
    '{"command": ["observe_property", 9, "speed"]}\n',
    '{"command": ["observe_property", 10, "pitch"]}\n',
]

export function connectToSocket() {
    try {
        connection = client.connect(address, null)
        outputStream = connection.get_output_stream()
        inputStream = connection.get_input_stream()
        dataStream = new Gio.DataInputStream({ base_stream: inputStream })

        commands.forEach(command => {
            outputStream.write(command, null)
        })

        function readLoop() {
            dataStream.read_line_async(0, null, (stream, result) => {
                const [line] = stream.read_line_finish(result)
                if (line) {
                    const text = new TextDecoder().decode(line)
                    const response = JSON.parse(text)

                    if (response.event === "property-change") {
                        switch (response.name) {
                            case "filename/no-ext":
                                mpvStatus.filename = response.data
                                break
                            case "path":
                                mpvStatus.filePath = response.data
                                cache.lastFilePlayed = response.data
                                writeFile(cacheFile, JSON.stringify(cache))
                                break
                            case "duration":
                                mpvStatus.duration = response.data
                                break
                            case "time-pos":
                                mpvStatus.timePos = response.data
                                break
                            case "pause":
                                mpvStatus.isPaused = response.data
                                cache.isPaused = response.data
                                writeFile(cacheFile, JSON.stringify(cache))
                                break
                            case "shuffle":
                                mpvStatus.isShuffled = response.data
                                cache.isShuffled = response.data
                                writeFile(cacheFile, JSON.stringify(cache))
                                break
                            case "loop-file":
                                mpvStatus.isLoopFile = response.data
                                cache.isLoopFile = response.data
                                writeFile(cacheFile, JSON.stringify(cache))
                                break
                            case "loop-playlist":
                                mpvStatus.isLoopPlaylist = response.data
                                cache.isLoopPlaylist = response.data
                                writeFile(cacheFile, JSON.stringify(cache))
                                break
                            case "speed":
                                mpvStatus.speed = response.data
                                break
                            case "pitch":
                                mpvStatus.pitch = response.data
                                break
                        }
//                         console.log(mpvStatus)
//                         console.log(metadata)
//                         console.log(playlistMetadata)
//                         console.log(labels)
                    }
                }
                readLoop()
            })
        }

        readLoop()

    } catch (error) {
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
            connectToSocket()
            return GLib.SOURCE_REMOVE
        })
    }
}

export async function extractMetadata(filePath: string) {
    const data = JSON.parse(await execAsync([
        "ffprobe",
        "-v", "quiet",
        "-print_format", "json",
        "-select_streams", "a:0",
        "-show_streams", "-show_format",
        filePath
    ]))

    const stream = data.streams?.[0] || {}
    const format = data?.format || {}

    function getTag(
        stream: any,
        format: any,
        tagName: string,
        fallback: any = null
    ): any {

        const toTitleCase = (str: string) =>
            str
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(" ")

        const variations = [
            tagName.toUpperCase(),
            tagName.toLowerCase(),
            toTitleCase(tagName),
            tagName.charAt(0).toUpperCase() + tagName.slice(1).toLowerCase(),
        ];

        for (const variant of variations) {
            if (stream.tags?.[variant]) return stream.tags[variant]
        }
        for (const variant of variations) {
            if (format.tags?.[variant]) return format.tags[variant]
        }

        return fallback
    }

    return {
        album: getTag(stream, format, "album", "Unassigned"),
        albumArtist: getTag(stream, format, "album artist") || getTag(stream, format, "album_artist", "Unknown"),
        genre: getTag(stream, format, "genre", "Unassigned"),
        artist: getTag(stream, format, "artist", "Unassigned"),
        title: getTag(stream, format, "title", mpvStatus.filename),
        year: getTag(stream, format, "date", "Unassigned"),

        disc: Number(getTag(stream, format, "disc")) || null,
        track: Number(getTag(stream, format, "track")) || null,

        filePathUrl: `file://${filePath}`,

        bitDepth: Number(stream.bits_per_sample) || Number(stream.bits_per_raw_sample) || "N/A",
        bitRateKbps: Math.round(Number(stream.bit_rate || format.bit_rate) / 1000) || null,
        channels: stream.channel_layout || "",
        codecName: stream.codec_name || "",
        durationMs: Math.round(Number(stream.duration * 1000)) || null,
        formatName: format.format_name || "",
        sampleFormat: stream.sample_fmt || "",
        sampleRate: Number(stream.sample_rate) || null,
    }
}

export function mpvSendCommand(command: any) {
    if (!outputStream) return
        const commandStr = JSON.stringify(command) + "\n"
        const bytes = new TextEncoder().encode(commandStr)
        outputStream.write(bytes, null)
}

export function toggleSidePanel() {
    const sidePanel = app.get_window("sidePanel")
    sidePanel.visible = !sidePanel.visible
}

export function toggleSecondSidePanel() {
    const secondSidePanel = app.get_window("secondSidePanel")
    secondSidePanel.visible = !secondSidePanel.visible
}

export function toggleMusicPlayerPopup() {
    const musicPlayerPopup = app.get_window("musicPlayerPopup")
    musicPlayerPopup.visible = !musicPlayerPopup.visible
}

export function cycleLoopState() {
    if (mpvStatus.isLoopFile === "inf") {
        mpvSendCommand({ command: ["set_property", "loop-file", "no"] })
        mpvSendCommand({ command: ["set_property", "loop-playlist", "no"] })
    } else if (mpvStatus.isLoopFile === false && mpvStatus.isLoopPlaylist === "inf") {
        mpvSendCommand({ command: ["set_property", "loop-file", "inf"] })
    } else {
        mpvSendCommand({ command: ["set_property", "loop-playlist", "inf"] })
    }
}
