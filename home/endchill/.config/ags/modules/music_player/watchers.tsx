import GLib from "gi://GLib?version=2.0"
import Gio from "gi://Gio?version=2.0"
import { execAsync } from "ags/process"
import { mpvStatus, metadata, playlistMetadata, labels } from "./main.tsx"
import { extractMetadata } from "./functions.tsx"

mpvStatus.connect("notify::file-path", async () => {
    const data = await extractMetadata(mpvStatus.filePath)

    metadata.album = data.album
    metadata.albumArtist = data.albumArtist
    metadata.artist = data.artist
    metadata.disc = data.disc
    metadata.genre = data.genre
    metadata.title = data.title
    metadata.track = data.track
    metadata.year = data.year

    metadata.bitDepth = data.bitDepth
    metadata.bitRateKbps = data.bitRateKbps
    metadata.channels = data.channels
    metadata.codecName = data.codecName
    metadata.durationMs = data.durationMs
    metadata.formatName = data.formatName
    metadata.sampleFormat = data.sampleFormat
    metadata.sampleRate = data.sampleRate

    playlistMetadata.filePathUrl = data.filePathUrl

    labels.barFirstLine = `${data.albumArtist} - ${data.title}`
    labels.barSecondLine = `${data.disc} - ${data.track}`

    labels.sidePanelFirstLine = `${data.disc ? `${data.disc}-` : ""}${data.track ? `${data.track}. ` : ""} ${data.title ? data.title : mpvStatus.filename}`
    labels.sidePanelSecondLine = `${data.albumArtist} - ${data.album}`
    labels.sidePanelThirdLine = `${data.codecName} | ${data.sampleRate} kHz | ${data.bitRateKbps} kbps | ${(() => {
        if (data.bitDepth !== Number(data.bitDepth)) return `${data.bitDepth}`
        if (data.sampleFormat.includes("flt")) {
            return `${data.bitDepth} bit float`
        }
        return `${data.bitDepth} bit`
    })()}`

    labels.popupFirstLine = `${data.albumArtist} - ${data.title}`
    labels.popupSecondLine = `${data.disc} - ${data.track}`
    labels.popupThirdLine = `${data.disc} - ${data.track}`
})

mpvStatus.connect("notify::file-path", async () => {
    const codecOutput = await execAsync(
        `ffprobe -v error -select_streams v -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${mpvStatus.filePath}"`
    )
    const codec = codecOutput.trim()
    const extension = codec === "mjpeg" ? "jpeg" : codec
    const tmpCoverPath = `${GLib.get_user_cache_dir()}/ags/music_player/covers/tmp.${extension}`
    const fallbackCover = `${GLib.get_user_config_dir()}/ags/icons/music_player/no_cover.svg`
    const checksum = GLib.Checksum.new(GLib.ChecksumType.SHA256)

    try {
        await execAsync(`ffmpeg -i "${mpvStatus.filePath}" -an -vcodec copy "${tmpCoverPath}"`)

        const tmpCoverFile = Gio.File.new_for_path(tmpCoverPath)
        const [success, contents] = tmpCoverFile.load_contents(null)

        checksum.update(contents)

        const hash = checksum.get_string()
        const coverPath = `${GLib.get_user_cache_dir()}/ags/music_player/covers/${hash}.${extension}`

        if (GLib.file_test(coverPath, GLib.FileTest.EXISTS)) {
            GLib.remove(tmpCoverPath)
        } else {
            GLib.rename(tmpCoverPath, coverPath)
        }

        metadata.coverPath = coverPath
    } catch (error) {
        metadata.coverPath = fallbackCover
    }
})
